// 工作流底部输入区：输入框 + 右侧操作按钮
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: ViewStyle;
}

export function WorkflowInputBar({
  value,
  onChangeText,
  containerStyle,
}: WorkflowInputBarProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.inputContainer, { backgroundColor: cardColor }, containerStyle]}>
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="发消息或按住说话"
        placeholderTextColor="#999"
        multiline
        value={value}
        onChangeText={onChangeText}
        underlineColorAndroid="transparent"
      />

      <View style={styles.actionRow}>
        <View style={styles.leftActions} />

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="add" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="mic-outline" size={24} color={textColor} />
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
    elevation: 4,
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
});
