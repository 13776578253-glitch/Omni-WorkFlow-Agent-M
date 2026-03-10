import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowFileUploadProps {
  visible: boolean;
  onClose: () => void;
  onPressCamera: () => void;
  onPressFile: () => void;
}

export function WorkflowFileUpload({
  visible,
  onClose,
  onPressCamera,
  onPressFile,
}: WorkflowFileUploadProps) {
  const panelColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#3A3A3C' }, 'border');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.menuCard, { backgroundColor: panelColor }]}>
          <TouchableOpacity style={styles.menuItem} onPress={onPressCamera} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={18} color={textColor} />
            <ThemedText style={[styles.menuText, { color: textColor }]}>拍照上传</ThemedText>
          </TouchableOpacity>
          {/* 待处理功能 */}
          <TouchableOpacity style={styles.menuItem} onPress={onPressCamera} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={18} color={textColor} />
            <ThemedText style={[styles.menuText, { color: textColor }]}>图片上传</ThemedText>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <TouchableOpacity style={styles.menuItem} onPress={onPressFile} activeOpacity={0.8}>
            <Ionicons name="folder-open-outline" size={18} color={textColor} />
            <ThemedText style={[styles.menuText, { color: textColor }]}>文件上传</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 84,
    paddingHorizontal: 16,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  menuCard: {
    width: 182,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
