import * as DocumentPicker from 'expo-document-picker';

export interface WorkflowUploadFileResult {
  canceled: boolean;         // 是否取消操作
  uri?: string;              // 本地文件路径 (可选)
  mimeType?: string | null;  // 文件类型
  name?: string;             // 文件名
  size?: number | null;      // 文件大小 (字节数)
}

export async function pickWorkflowUploadFile(): Promise<WorkflowUploadFileResult> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,         // 选择单文件
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  return {
    canceled: false,
    uri: asset.uri,
    mimeType: asset.mimeType,
    name: asset.name,
    size: asset.size,
  };
}
