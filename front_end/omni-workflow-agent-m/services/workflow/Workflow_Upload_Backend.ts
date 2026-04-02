import {
  submitLongAudioTask,
  transcript,
  uploadAudio,
  uploadFile,
} from '@/api/workflow-api';
import type { WorkflowAttachment, WorkflowFileRef } from '@/constants/workflow_type';
import { WorkflowLocalFileStorage } from './Workflow_upload_local_file';

// 后端文件上传服务 / 负责将本地文件上传到后端并返回文件 URL/ID / 包含状态更新和错误处理
export async function uploadAttachmentToBackend(attachment: WorkflowAttachment): Promise<WorkflowFileRef> {
  const fileEntry = await WorkflowLocalFileStorage.getFile(attachment.id);
  if (!fileEntry) throw new Error('File not found');

  await WorkflowLocalFileStorage.updateStatus(attachment.id, 'uploading');

  try {
    const result = await uploadFile({
      file: {
        uri: fileEntry.localPath,
        name: fileEntry.originalName,
        type: fileEntry.mimeType,
      },
    });
    const fileRef = result.fileRef;
    if (!fileRef?.fileName) {
      throw new Error('File upload response missing fileRef');
    }

    await WorkflowLocalFileStorage.updateStatus(attachment.id, 'success');
    return fileRef;
  } catch (error) {
    await WorkflowLocalFileStorage.updateStatus(attachment.id, 'error');
    throw error;
  }
}

export async function uploadWorkflowAudioToBackend(params: {
  localPath: string;
  fileName: string;
  mimeType: string;
  durationMs?: number;
}): Promise<{ remoteAudioId: string }> {
  const result = await uploadAudio({
    file: {
      uri: params.localPath,
      name: params.fileName,
      type: params.mimeType,
    },
    durationMs: params.durationMs,
  });

  if (!result.remoteAudioId) {
    throw new Error('Audio upload missing remote audio id');
  }

  return { remoteAudioId: String(result.remoteAudioId) };
}

export async function requestWorkflowAudioTranscript(params: {
  remoteAudioId?: string;
  localUrl?: string;
}): Promise<{ transcriptText: string }> {
  const result = await transcript({
    audioResourceId: params.remoteAudioId,
    audioUri: params.localUrl,
  });

  const transcriptText = result.fullText ?? '';
  if (!transcriptText) {
    throw new Error('Audio transcript response missing full text');
  }

  return { transcriptText: String(transcriptText) };
}

export async function submitWorkflowLongAudioTask(params: {
  remoteAudioId?: string | null;
  audioUri?: string | null;
  durationMs?: number;
  prompt: string;
  sessionId?: string | null;
}): Promise<{ accepted: boolean; taskId?: string; sessionId?: string }> {
  const result = await submitLongAudioTask({
    audioResourceId: params.remoteAudioId ?? undefined,
    audioUri: params.audioUri ?? undefined,
    durationMs: params.durationMs,
    prompt: params.prompt,
    sessionId: params.sessionId ?? undefined,
  });

  return {
    accepted: result.accepted,
    taskId: result.taskId ? String(result.taskId) : undefined,
    sessionId: result.sessionId ? String(result.sessionId) : undefined,
  };
}
