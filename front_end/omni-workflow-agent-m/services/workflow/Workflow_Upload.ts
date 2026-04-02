import type {
  WorkflowRecordingSession,
  WorkflowRecordingPhase,
  WorkflowRecordingPipelineResult,
  WorkflowRecordingUploadPayload,
  WorkflowRecordingMode
} from '@/constants/workflow_type';

// 录音
// 可复用逻辑 
interface WorkflowUploadRuntime {
  // 请求录音
  requestPermission: () => Promise<boolean>;
  // 开始录音 / 返回本地音频提示 临时路径（可选）/ 测试
  startNativeRecording: () => Promise<{ localUrlHint?: string }>;
  // 停止录音 / 路径+时长
  stopNativeRecording: () => Promise<{ localUrl: string; durationMs: number }>;
  // 上传音频
  uploadAudio: (payload: WorkflowRecordingUploadPayload) => Promise<{ remoteAudioId: string }>;
  // 返回转写结果 / 变成文字指令
  requestTranscript: (params: { remoteAudioId: string; localUrl: string }) => Promise<{
    transcriptText: string;
    // transcriptSegments: WorkflowTranscriptSegment[];
  }>;
}

// 测试 / mock数据 / 待开发
const DEFAULT_RUNTIME: WorkflowUploadRuntime = {
  async requestPermission() {
    return true;
  },
  async startNativeRecording() {
    return {};
  },
  async stopNativeRecording() {
    return {
      localUrl: `mock://audio-${Date.now()}.m4a`,
      durationMs: 1500,
    };
  },
  async uploadAudio() {
    return { remoteAudioId: `mock-audio-${Date.now()}` };
  },
  async requestTranscript() {
    return {
      transcriptText: 'Mock transcript content.',
      transcriptSegments: [
        { startTime: 0, endTime: 1.5, text: 'Mock transcript content.' },
      ],
    };
  },
};

// 创建录音会话
function createSession(phase: WorkflowRecordingPhase, mode: WorkflowRecordingMode): WorkflowRecordingSession {
  const now = Date.now();
  return {
    sessionId: `record-${now}`,
    mode,                      // 录音模式
    phase,                     // 流程阶段
    startedAt: now,            // 会话时间戳
  };
}

export class WorkflowUploadService {
  private runtime: WorkflowUploadRuntime;

  constructor(runtime?: Partial<WorkflowUploadRuntime>) {
    this.runtime = {
      ...DEFAULT_RUNTIME,
      ...runtime,
    };
  }

  // 开始录音
  async startPressRecording(mode: WorkflowRecordingMode = 'press-to-talk'): Promise<WorkflowRecordingSession> {
    // 请求权限
    const requesting = createSession('requesting_permission', mode);
    const granted = await this.runtime.requestPermission();
    if (!granted) {
      return {
        ...requesting,
        phase: 'error',
        errorMessage: '会话创建失败',
      };
    }

    await this.runtime.startNativeRecording();

    return {
      ...requesting,
      phase: 'recording',
      startedAt: Date.now(),
    };
  }

  // 停止录音
  async stopPressRecording(session: WorkflowRecordingSession): Promise<WorkflowRecordingSession> {
    if (session.phase !== 'recording') {
      return {
        ...session,
        phase: 'error',
        errorMessage: '停止会话失败，非录音状态',
      };
    }

    const stoppedAt = Date.now();
    const { localUrl, durationMs } = await this.runtime.stopNativeRecording();

    return {
      ...session,
      phase: 'stopping',
      stoppedAt,
      durationMs,
      localUrl,
    };
  }

  // 上传/转写
  async runPressToTalkPipeline(session: WorkflowRecordingSession): Promise<WorkflowRecordingPipelineResult> {
    if (!session.localUrl) {
      return {
        session: {
          ...session,
          phase: 'error',
          errorMessage: '缺失缓存音频路径',
        },
        transcriptText: '',
        // transcriptSegments: [],
      };
    }
    const localUrl = session.localUrl;

    // 创建 上传中 会话
    const uploadingSession: WorkflowRecordingSession = {
      ...session,
      phase: 'uploading',
    };
    
    // 创建 上传 会话
    const uploadResult = await this.runtime.uploadAudio({
      url: localUrl,                                        // 测试
      fileName: `record-${uploadingSession.startedAt}.m4a`, // 文件名
      mimeType: 'audio/m4a',                                // 音频类型：m4a / 待确定
      durationMs: uploadingSession.durationMs,              // 录音时长
    });

    // 创建 转写中 会话
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
      transcriptText: transcript.transcriptText,  // 转写 完整文字
      // transcriptSegments: transcript.transcriptSegments,
    };
  }
}

export function createWorkflowUploadService(runtime?: Partial<WorkflowUploadRuntime>) {
  return new WorkflowUploadService(runtime);
}
