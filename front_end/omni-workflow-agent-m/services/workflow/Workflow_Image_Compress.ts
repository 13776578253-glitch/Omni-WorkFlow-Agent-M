import * as ImageManipulator from 'expo-image-manipulator';

const THUMBNAIL_SIZE = 150; // 缩略图尺寸

// 图片压缩 / 生成缩略图和判断是否为图片文件
export async function generateThumbnail(imageUri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}
