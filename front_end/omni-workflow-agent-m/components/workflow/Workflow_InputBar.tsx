import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/use-theme-color';


interface WorkflowInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  containerStyle?: ViewStyle;
}

export function WorkflowInputBar({ value, onChangeText, onSubmit, containerStyle }: WorkflowInputBarProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.inputContainer, { backgroundColor: cardColor }, containerStyle]}>
      {/* 输入区 */}
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="发消息或按住说话"
        placeholderTextColor="#999"
        multiline
        value={value}
        onChangeText={onChangeText}
        underlineColorAndroid="transparent"
      />

      {/* 功能区 */}
      <View style={styles.actionRow}>
        <View style={styles.leftActions} />

        <View style={styles.rightActions}>
          {/* 文件上传 */}
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="add" size={24} color={textColor} />
          </TouchableOpacity>
          {/* 长时录音 */}
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="mic-outline" size={24} color={textColor} />
          {/* 发送 */}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendIconCircle,
              hasText
                ? styles.sendIconCircleActive
                : styles.sendIconCircleInactive,
            ]}
            onPress={onSubmit}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={hasText ? '#FFFFFF' : textColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 16,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#7A7A7A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  input: {
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconCircleInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  sendIconCircleActive: {
    backgroundColor: '#3B82F6',
    borderWidth: 0,
  },
});
