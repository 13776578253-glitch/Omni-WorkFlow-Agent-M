import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import type {
  WorkflowRecordingMode,
  WorkflowRecordingPhase,
  WorkflowRecordingPipelineResult,
  WorkflowRecordingSession,
  WorkflowRecordingSource,
  WorkflowRecordingUploadPayload,
  WorkflowTranscriptStrategy,
} from '@/constants/workflow_type';
import {
  requestWorkflowAudioTranscript,
  uploadWorkflowAudioToBackend,
} from '@/services/workflow/Workflow_Upload_Backend';

// 工作流上传服务 / 负责录音权限、录音控制、文件管理、上传和转写请求 / 可替换底层实现（如使用第三方 SDK） / 待完善错误处理和边界情况考虑
const RECORDING_DIR = `${FileSystem.documentDirectory}workflow_recordings/`;

// 录音上传服务类 
const MOCK_TRANSCRIPTS: Record<WorkflowRecordingSource, string> = {
  'home-press': '帮我整理这份排期规划和任务表，结合我上传的文件。',    
  'workflow-press': '请把这段按住说话的内容整理成结构化任务清单，并继续生成后续结果。',
  'workflow-long-form': '请整理这段长时录音的完整内容，提取重点并生成概要。',
};
const MAX_REASONABLE_RECORDING_DURATION_MS = 12 * 60 * 60 * 1000;

// 工作流上传服务
interface WorkflowUploadRuntime {
  requestPermission: () => Promise<boolean>;
  startNativeRecording: () => Promise<{ localUrlHint?: string }>;
  stopNativeRecording: (params: {
    startedAt: number;
    mode: WorkflowRecordingMode;
  }) => Promise<{ localUrl: string; durationMs: number }>;
  uploadAudio: (payload: WorkflowRecordingUploadPayload) => Promise<{ remoteAudioId: string }>;
  requestTranscript: (params: { remoteAudioId: string; localUrl: string }) => Promise<{
    transcriptText: string;
  }>;
}

async function ensureRecordingDir() {
  const dirInfo = await FileSystem.getInfoAsync(RECORDING_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECORDING_DIR, { intermediates: true });
  }
}

// 辅助函数 / 推断文件扩展名 / 处理 URI 中可能的查询参数 / 提供默认扩展名
function inferExtension(uri: string | null | undefined) {
  if (!uri) return 'm4a';
  const cleaned = uri.split('?')[0] ?? uri;
  const ext = cleaned.split('.').pop();
  return ext && ext.length <= 6 ? ext : 'm4a';
}

function getDefaultSource(mode: WorkflowRecordingMode): WorkflowRecordingSource {
  return mode === 'long-form' ? 'workflow-long-form' : 'workflow-press';
}

function getMockTranscript(source: WorkflowRecordingSource) {
  return MOCK_TRANSCRIPTS[source];
}

function createSession(
  phase: WorkflowRecordingPhase,
  mode: WorkflowRecordingMode,
  source: WorkflowRecordingSource
): WorkflowRecordingSession {
  const now = Date.now();
  return {
    sessionId: `record-${now}`,
    mode,
    source,
    phase,
    startedAt: now,
  };
}

function createDefaultRuntime(): WorkflowUploadRuntime {
  let recorder: InstanceType<typeof AudioModule.AudioRecorder> | null = null;

  return {
    async requestPermission() {
      const permission = await requestRecordingPermissionsAsync();
      return permission.granted;
    },
    async startNativeRecording() {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();
      recorder.record();

      return {
        localUrlHint: recorder.getStatus().url ?? recorder.uri ?? undefined,
      };
    },
    async stopNativeRecording({ startedAt, mode }) {
      if (!recorder) {
        throw new Error('Recorder is not initialized');
      }

      const activeRecorder = recorder;
      recorder = null;
      const durationBeforeStopMsRaw = Math.max(0, Math.round(activeRecorder.currentTime * 1000));
      const previewUriBeforeStop = activeRecorder.uri;

      await activeRecorder.stop();
      const status = activeRecorder.getStatus();
      const sourceUri = status.url ?? activeRecorder.uri ?? previewUriBeforeStop;
      const durationCandidates = [
        status.durationMillis,
        durationBeforeStopMsRaw,
        Date.now() - startedAt,
      ].filter((value): value is number =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value > 0 &&
        value <= MAX_REASONABLE_RECORDING_DURATION_MS
      );
      const durationMs = durationCandidates.length > 0 ? Math.max(...durationCandidates) : 0;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      if (!sourceUri) {
        throw new Error('Missing recorded audio uri');
      }

      await ensureRecordingDir();
      const extension = inferExtension(sourceUri);
      const localUrl = `${RECORDING_DIR}record-${startedAt}-${mode}.${extension}`;
      try {
        await FileSystem.copyAsync({ from: sourceUri, to: localUrl });
      } catch {
        return {
          localUrl: sourceUri,
          durationMs,
        };
      }

      return {
        localUrl,
        durationMs,
      };
    },
    async uploadAudio(payload) {
      return uploadWorkflowAudioToBackend({
        localPath: payload.url,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        durationMs: payload.durationMs,
      });
    },
    async requestTranscript(params) {
      return requestWorkflowAudioTranscript({
        remoteAudioId: params.remoteAudioId,
        localUrl: params.localUrl,
      });
    },
  };
}

export class WorkflowUploadService {
  private runtime: WorkflowUploadRuntime;

  constructor(runtime?: Partial<WorkflowUploadRuntime>) {
    this.runtime = {
      ...createDefaultRuntime(),
      ...runtime,
    };
  }

  async startPressRecording(
    mode: WorkflowRecordingMode = 'press-to-talk',
    source: WorkflowRecordingSource = getDefaultSource(mode)
  ): Promise<WorkflowRecordingSession> {
    const requesting = createSession('requesting_permission', mode, source);
    const granted = await this.runtime.requestPermission();
    if (!granted) {
      return {
        ...requesting,
        phase: 'error',
        errorMessage: '会话创建失败',
      };
    }

    try {
      const nativeState = await this.runtime.startNativeRecording();
      return {
        ...requesting,
        phase: 'recording',
        startedAt: Date.now(),
        localUrl: nativeState.localUrlHint,
      };
    } catch (error) {
      return {
        ...requesting,
        phase: 'error',
        errorMessage: error instanceof Error ? error.message : '开始录音失败',
      };
    }
  }

  async stopPressRecording(session: WorkflowRecordingSession): Promise<WorkflowRecordingSession> {
    if (session.phase !== 'recording') {
      return {
        ...session,
        phase: 'error',
        errorMessage: '停止会话失败，非录音状态',
      };
    }

    try {
      const stoppedAt = Date.now();
      const { localUrl, durationMs } = await this.runtime.stopNativeRecording({
        startedAt: session.startedAt,
        mode: session.mode,
      });

      return {
        ...session,
        phase: 'stopping',
        stoppedAt,
        durationMs,
        localUrl,
      };
    } catch (error) {
      return {
        ...session,
        phase: 'error',
        errorMessage: error instanceof Error ? error.message : '停止录音失败',
      };
    }
  }

  async runPressToTalkPipeline(
    session: WorkflowRecordingSession,
    options?: {
      strategy?: WorkflowTranscriptStrategy;
      source?: WorkflowRecordingSource;
    }
  ): Promise<WorkflowRecordingPipelineResult> {
    if (!session.localUrl) {
      return {
        session: {
          ...session,
          phase: 'error',
          errorMessage: '缺失缓存音频路径',
        },
        transcriptText: '',
      };
    }

    const source = options?.source ?? session.source;
    const strategy =
      options?.strategy ??
      (source === 'workflow-long-form' ? 'api_then_mock_fallback' : 'mock_only');

    if (strategy === 'mock_only') {
      return {
        session: {
          ...session,
          phase: 'completed',
        },
        transcriptText: getMockTranscript(source),
      };
    }

    const uploadingSession: WorkflowRecordingSession = {
      ...session,
      phase: 'uploading',
    };

    try {
      const uploadResult = await this.runtime.uploadAudio({
        url: session.localUrl,
        fileName: `record-${uploadingSession.startedAt}.m4a`,
        mimeType: 'audio/m4a',
        durationMs: uploadingSession.durationMs,
      });

      const transcribingSession: WorkflowRecordingSession = {
        ...uploadingSession,
        phase: 'transcribing',
        remoteAudioId: uploadResult.remoteAudioId,
      };

      const transcript = await this.runtime.requestTranscript({
        remoteAudioId: uploadResult.remoteAudioId,
        localUrl: transcribingSession.localUrl!,
      });

      return {
        session: {
          ...transcribingSession,
          phase: 'completed',
        },
        transcriptText: transcript.transcriptText,
      };
    } catch {
      return {
        session: {
          ...uploadingSession,
          phase: 'completed',
        },
        transcriptText: getMockTranscript(source),
      };
    }
  }
}

export function createWorkflowUploadService(runtime?: Partial<WorkflowUploadRuntime>) {
  return new WorkflowUploadService(runtime);
}
