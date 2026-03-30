import type { WorkflowAttachment } from '@/constants/workflow_type';
import { WorkflowLocalFileStorage } from './Workflow_upload_local_file';

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
