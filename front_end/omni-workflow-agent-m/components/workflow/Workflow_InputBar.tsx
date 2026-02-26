import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, TouchableOpacity, View, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onPressInRecord?: () => void;
  onPressOutRecord?: () => void;
  onCancelRecord?: () => void;
  onSlideCancelStateChange?: (isCancel: boolean) => void;
  isPressRecording?: boolean;
  recordSlideCancelThreshold?: number;
  containerStyle?: ViewStyle;
}

export function WorkflowInputBar({
  value,
  onChangeText,
  onSubmit,
  onPressInRecord,
  onPressOutRecord,
  onCancelRecord,
  onSlideCancelStateChange,
  isPressRecording = false,
  recordSlideCancelThreshold = 56,
  containerStyle,
}: WorkflowInputBarProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  // 输入框文字数量 / 控制发送 UI
  const hasText = value.trim().length > 0;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isPressHolding, setIsPressHolding] = useState(false);

  // 持久化 Ref / 测试 / 待确认
  const pressStartYRef = useRef<number | null>(null);  // 按动时 Y坐标
  const lastTouchYRef = useRef<number | null>(null);   // 滑动时 Y坐标
  const slideCancelRef = useRef(false);                // 触发 滑动取消 / 需要修改
  const longPressStartedRef = useRef(false);           // 触发 长按     / 需要修改
  const inputRef = useRef<TextInput>(null);            // 输入框 Ref / 聚焦
  
  // 录音 启动 / 未录音 + 键盘收起 + 无输入框文字(可选)
  const pressToRecordEnabled = !isPressRecording && !isKeyboardVisible && value.trim().length === 0;
  // 录音层 显隐
  const showPressRecordTouchLayer = pressToRecordEnabled || isPressHolding;

  // 键盘 监听 / 弹出/收起
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      inputRef.current?.blur();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 更新滑动状态 / 待修改
  const updateSlideCancelState = (currentY: number | null) => {
    if (!longPressStartedRef.current || pressStartYRef.current == null || currentY == null) return;
    const deltaY = pressStartYRef.current - currentY;
    const nextIsCancel = deltaY > recordSlideCancelThreshold;
    if (slideCancelRef.current !== nextIsCancel) {
      slideCancelRef.current = nextIsCancel;
      onSlideCancelStateChange?.(nextIsCancel);
    }
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    setIsPressHolding(true);
    pressStartYRef.current = event.nativeEvent.pageY;
    lastTouchYRef.current = event.nativeEvent.pageY;
    slideCancelRef.current = false;
    longPressStartedRef.current = false;
    onSlideCancelStateChange?.(false);
  };

  const handleTapInputArea = () => {
    if (!longPressStartedRef.current) {
      inputRef.current?.focus();
    }
  };

  const handleLongPress = (event: GestureResponderEvent) => {
    if (pressStartYRef.current == null) {
      pressStartYRef.current = event.nativeEvent.pageY;
    }
    lastTouchYRef.current = event.nativeEvent.pageY;
    longPressStartedRef.current = true;
    onPressInRecord?.();
    updateSlideCancelState(lastTouchYRef.current);
  };

  const handlePressMove = (event: GestureResponderEvent) => {
    lastTouchYRef.current = event.nativeEvent.pageY;
    updateSlideCancelState(lastTouchYRef.current);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    setIsPressHolding(false);
    lastTouchYRef.current = event.nativeEvent.pageY;
    updateSlideCancelState(lastTouchYRef.current);
    if (!longPressStartedRef.current) return;

    if (slideCancelRef.current) {
      onCancelRecord?.();
    } else {
      onPressOutRecord?.();
    }

    slideCancelRef.current = false;
    onSlideCancelStateChange?.(false);
    pressStartYRef.current = null;
    lastTouchYRef.current = null;
    longPressStartedRef.current = false;
  };

  return (
    <View style={[styles.inputContainer, { backgroundColor: cardColor }, containerStyle]}>
      {/* 输入区 */}
      <View style={styles.inputTouchArea}>
        {/* 文本输入 */}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor }]}
          placeholder="发消息或按住说话"
          placeholderTextColor="#999"
          multiline
          value={value}
          onChangeText={onChangeText}
          underlineColorAndroid="transparent"
        />
        {/* 录音(按住说话) / 长按显隐 */}
        {/* 待修改 */}
        {showPressRecordTouchLayer ? (
          <Pressable
            style={styles.pressRecordTouchLayer}
            onPress={handleTapInputArea}
            onPressIn={handlePressIn}
            onLongPress={handleLongPress}
            onTouchMove={handlePressMove}
            onPressOut={handlePressOut}
            delayLongPress={180}          // 长按延迟
          />
        ) : null}
      </View>

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
          </TouchableOpacity>
          {/* 发送 */}
          <TouchableOpacity
            style={[
              styles.sendIconCircle,
              hasText ? styles.sendIconCircleActive : styles.sendIconCircleInactive,
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
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  inputTouchArea: {
    position: 'relative',
  },
  pressRecordTouchLayer: {
    ...StyleSheet.absoluteFillObject,
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

