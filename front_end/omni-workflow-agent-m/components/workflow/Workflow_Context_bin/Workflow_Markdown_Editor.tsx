import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowMarkdownEditorProps {
  initialContent: string;                   // 初始 Markdown 内容
  onSave: (newContent: string) => void;     
  onCancel: () => void;                    
}

export function WorkflowMarkdownEditor({ initialContent, onSave, onCancel }: WorkflowMarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const inputRef = useRef<TextInput>(null);
  
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  // const borderColor = useThemeColor({}, 'border');   // 待处理样式
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    // 编辑模式 聚焦输入框
    inputRef.current?.focus();
  }, []);

  // 保存编辑 文本
  const handleSave = () => {
    onSave(content);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: textColor }]}
        multiline={true}                              // 多行输入
        value={content}
        onChangeText={setContent}
        placeholder="Edit markdown..."                // 输入框占位符
        placeholderTextColor={textColor + '80'}       // 占位符文本颜色
        textAlignVertical="top"                       // 垂直对齐顶部
      />
      
      {/* 编辑栏 / 取消和保存按钮 */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onCancel} style={styles.button}>
          <Text style={[styles.buttonText, { color: textColor }]}>取消</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton, { backgroundColor: tintColor }]}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  input: {
    minHeight: 100,
    fontSize: 16,
    lineHeight: 24,
    padding: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButton: {
    // 保存按钮背景颜色 / 待处理样式
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
