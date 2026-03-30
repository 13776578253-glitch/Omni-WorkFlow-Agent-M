import * as ImagePicker from 'expo-image-picker';

export async function pickWorkflowGalleryImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('需要相册权限');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (!result.canceled && result.assets[0]) {
    return {
      uri: result.assets[0].uri,
      fileName: result.assets[0].fileName || `image_${Date.now()}.jpg`,
      mimeType: result.assets[0].mimeType || 'image/jpeg',
    };
  }
  return null;
}
