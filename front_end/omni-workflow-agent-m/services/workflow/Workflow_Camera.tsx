import * as ImagePicker from 'expo-image-picker';

export interface WorkflowCameraResult {
  canceled: boolean;           // 是否取消操作
  uri?: string;                // 本地图片路径 (可选)
  mimeType?: string | null;    // 图片类型
  fileName?: string | null;    // 文件名
  fileSize?: number | null;    // 图片大小 (字节数) (可选)
}

export async function pickWorkflowCameraImage(): Promise<WorkflowCameraResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { canceled: true };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,           // 图片质量
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  // 提取拍摄结果
  const asset = result.assets[0];
  return {
    canceled: false,
    uri: asset.uri,           // 图片本地路径
    mimeType: asset.mimeType, // 图片类型
    fileName: asset.fileName, // 文件名
    fileSize: asset.fileSize, // 文件大小 (可选)
  };
}
