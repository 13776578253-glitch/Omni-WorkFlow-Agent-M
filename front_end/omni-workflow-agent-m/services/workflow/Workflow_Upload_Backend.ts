import type { WorkflowAttachment } from '@/constants/workflow_type';
import { WorkflowLocalFileStorage } from './Workflow_upload_local_file';

const API_BASE = 'http://localhost:8000/api';

// 后端文件上传服务 / 负责将本地文件上传到后端并返回文件 URL/ID / 包含状态更新和错误处理
export async function uploadAttachmentToBackend(attachment: WorkflowAttachment): Promise<string> {
  // TODO: Implement backend upload
  // 1. Read file from attachment.localPath
  // 2. Create FormData with file
  // 3. POST to backend upload endpoint
  // 4. Return backend file URL/ID
  // 5. Update local storage status

  const fileEntry = await WorkflowLocalFileStorage.getFile(attachment.id);
  if (!fileEntry) throw new Error('File not found');

  await WorkflowLocalFileStorage.updateStatus(attachment.id, 'uploading');

  try {
    // const formData = new FormData();
    // formData.append('file', {
    //   uri: fileEntry.localPath,
    //   name: fileEntry.originalName,
    //   type: fileEntry.mimeType
    // } as any);
    // const response = await fetch('YOUR_BACKEND_URL/upload', {
    //   method: 'POST',
    //   body: formData
    // });
    // const data = await response.json();

    await WorkflowLocalFileStorage.updateStatus(attachment.id, 'success');
    return 'BACKEND_FILE_URL';
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
  const formData = new FormData();
  formData.append('file', {
    uri: params.localPath,
    name: params.fileName,
    type: params.mimeType,
  } as any);

  if (typeof params.durationMs === 'number') {
    formData.append('durationMs', String(params.durationMs));
  }

  const response = await fetch(`${API_BASE}/workflow/audio/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Audio upload failed with status ${response.status}`);
  }

  const data = await response.json();
  const remoteAudioId = data?.remoteAudioId ?? data?.audioResourceId ?? data?.id;
  if (!remoteAudioId) {
    throw new Error('Audio upload missing remote audio id');
  }

  return { remoteAudioId: String(remoteAudioId) };
}

export async function requestWorkflowAudioTranscript(params: {
  remoteAudioId?: string;
  localUrl?: string;
}): Promise<{ transcriptText: string }> {
  const response = await fetch(`${API_BASE}/workflow/audio/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioResourceId: params.remoteAudioId,
      audioUri: params.localUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`Audio transcript failed with status ${response.status}`);
  }

  const data = await response.json();
  const transcriptText = data?.fullText ?? data?.transcriptText ?? '';
  if (!transcriptText) {
    throw new Error('Audio transcript response missing full text');
  }

  return { transcriptText: String(transcriptText) };
}
