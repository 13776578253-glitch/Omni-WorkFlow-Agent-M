import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, PanResponder, StyleSheet, TextInput, TouchableOpacity, View, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onPressInRecord?: () => void;                            // 长按开始 录音
  onPressOutRecord?: () => void;                           // 松开停止 录音
  onCancelRecord?: () => void;                             // 滑动取消 录音
  onSlideCancelStateChange?: (isCancel: boolean) => void;
  isPressRecording?: boolean;                              // 录音 状态
  recordSlideCancelThreshold?: number;                     // 滑动取消 阈值
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
  const pressStartXRef = useRef<number | null>(null);  // 按动时 X坐标
  const pressStartYRef = useRef<number | null>(null);  // 按动时 Y坐标
  const lastTouchXRef = useRef<number | null>(null);   // 滑动时 X坐标
  const lastTouchYRef = useRef<number | null>(null);   // 滑动时 Y坐标
  const slideCancelRef = useRef(false);                // 触发 滑动取消 
  const longPressStartedRef = useRef(false);           // 触发 长按     
  // 长计时器 Ref / 测试 / 长按延迟
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);  
        longPressTimerRef.current = null;
      }
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 监听 触摸事件 坐标
  const readTouchPoint = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      touches?: Array<{ pageX?: number; pageY?: number }>;
      changedTouches?: Array<{ pageX?: number; pageY?: number }>;
    };
    // 当前 触摸点 / 变化 触摸点
    const touch = nativeEvent.touches?.[0] ?? nativeEvent.changedTouches?.[0];
    const pageX = nativeEvent.pageX ?? touch?.pageX;
    const pageY = nativeEvent.pageY ?? touch?.pageY;
    return {
      x: Number.isFinite(pageX) ? pageX : null,
      y: Number.isFinite(pageY) ? pageY : null,
    };
  };

  // 更新 滑动取消状态 
  const updateSlideCancelState = (currentX: number | null, currentY: number | null) => {
    // 检验 / 未触发长按/无初始/当前坐标
    if (
      !longPressStartedRef.current || 
      pressStartXRef.current == null || pressStartYRef.current == null ||
      currentX == null || currentY == null
    ) {
      return;
    }

    // 滑动距离 计算
    const deltaY = pressStartYRef.current - currentY;            // Y 轴偏移
    const deltaX = Math.abs(currentX - pressStartXRef.current);  // X 轴偏移 (绝对值)

    // 取消阈值
    const cancelEnterThreshold = recordSlideCancelThreshold;                                  // 进入取消状态 (56px)
    const cancelExitThreshold = Math.max(12, Math.floor(recordSlideCancelThreshold * 0.72));  // 退出取消状态
    
    // 滑动方向
    const movingUp = deltaY > 0;
    const verticalDominant = deltaY > deltaX * 1.1;

    // 取消状态判断
    const nextIsCancel = slideCancelRef.current
      ? movingUp && deltaY > cancelExitThreshold
      : movingUp && verticalDominant && deltaY > cancelEnterThreshold;
    if (slideCancelRef.current !== nextIsCancel) {
      slideCancelRef.current = nextIsCancel;
      onSlideCancelStateChange?.(nextIsCancel);
    }
  };

  // 按住事件 / 初始化坐标 + 启动计时器
  const handlePressIn = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    setIsPressHolding(true);
    // 初始化坐标 Ref
    pressStartXRef.current = point.x;
    pressStartYRef.current = point.y;
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    // 重置状态
    slideCancelRef.current = false;
    longPressStartedRef.current = false;
    onSlideCancelStateChange?.(false);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      longPressStartedRef.current = true;
      onPressInRecord?.();
      updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);  // 初始化取消状态
    }, 180);
  };
   
  // 输入区 / 未触发长按 则聚焦
  const handleTapInputArea = () => {
    if (!longPressStartedRef.current) {
      inputRef.current?.focus();
    }
  };

  // 滑动事件 / 更新坐标 + 取消状态
  const handlePressMove = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);  // 最新坐标
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);  // 判断取消状态
  };

  // 松开
  const handlePressOut = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    setIsPressHolding(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);
    if (!longPressStartedRef.current) {
      handleTapInputArea();
      slideCancelRef.current = false;
      onSlideCancelStateChange?.(false);
      pressStartXRef.current = null;
      pressStartYRef.current = null;
      lastTouchXRef.current = null;
      lastTouchYRef.current = null;
      return;
    }

    if (slideCancelRef.current) {
      onCancelRecord?.();
    } else {
      onPressOutRecord?.();
    }

    slideCancelRef.current = false;
    onSlideCancelStateChange?.(false);
    pressStartXRef.current = null;
    pressStartYRef.current = null;
    lastTouchXRef.current = null;
    lastTouchYRef.current = null;
    longPressStartedRef.current = false;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          handlePressIn(event);
        },
        onPanResponderMove: (event) => {
          handlePressMove(event);
        },
        onPanResponderRelease: (event) => {
          handlePressOut(event);
        },
        onPanResponderTerminate: (event) => {
          handlePressOut(event);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [handlePressIn, handlePressMove, handlePressOut]
  );

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
          <View
            style={[
              styles.pressRecordTouchLayer,
              isPressHolding ? styles.pressRecordTouchLayerExpanded : null,
            ]}
            {...panResponder.panHandlers}
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
  pressRecordTouchLayerExpanded: {
    top: -420,
    bottom: -120,
    left: -40,
    right: -40,
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

