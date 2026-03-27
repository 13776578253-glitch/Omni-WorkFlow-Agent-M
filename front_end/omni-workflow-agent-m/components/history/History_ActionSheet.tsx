import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { HistorySession } from '@/services/history/History_Storage';

const SLIDE_OFFSET = 400; // 确保 移出屏幕

interface HistoryActionSheetProps {
  session: HistorySession | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (session: HistorySession) => void;
  onRename: (session: HistorySession) => void;
  onTogglePin: (session: HistorySession) => void;
}

export default function History_ActionSheet({
  session,
  visible,
  onClose,
  onDelete,
  onRename,
  onTogglePin,
}: HistoryActionSheetProps) {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  const translateY = useSharedValue(SLIDE_OFFSET);
  const closingRef = useRef(false); // 动画锁：防止重复触发关闭

  // 滑入动画
  const animateIn = useCallback(() => {
    closingRef.current = false;
    translateY.value = SLIDE_OFFSET;
    translateY.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
  }, [translateY]);

  // 滑出动画 / 回调 onClose
  const animateOut = useCallback((done: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    translateY.value = withTiming(
      SLIDE_OFFSET,
      { duration: 220, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(done)();
      }
    );
  }, [translateY]);

  const handleClose = useCallback(() => {
    animateOut(() => {
      closingRef.current = false;
      onClose();
    });
  }, [animateOut, onClose]);

  useEffect(() => {
    if (visible) animateIn();
  }, [visible, animateIn]);

  // 拖拽下滑关闭手势 
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // 仅允许向下拖动，且 translateY 不为负
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      // 超过阈值或快速下滑关闭 / 否则回弹
      if (e.translationY > 80 || e.velocityY > 500) {
        translateY.value = withTiming(
          SLIDE_OFFSET,
          { duration: 200, easing: Easing.in(Easing.quad) },
          (finished) => {
            if (finished) runOnJS(onClose)();
          }
        );
      } else {
        // 回弹到初始位置
        translateY.value = withSpring(0, { damping: 40, stiffness: 400, mass: 0.6 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!session) return null;

  // 主题色 / 测试
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const handleColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';
  const separatorColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.rootView}>
        {/* 背景遮罩 / Pressable 点击关闭 */}
        <Pressable style={styles.overlay} onPress={handleClose} />

        {/* Sheet 主体 / GestureDetector 拖拽接管 */}
        <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { backgroundColor: cardBg }, sheetStyle]}>

          {/* 拖动把手 */}
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          {/* Session 标题预览 */}
          <Text style={[styles.sessionTitle, { color: themeColors.icon }]} numberOfLines={1}>
            {session.title}
          </Text>

          {/* 删除 */}
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => { onDelete(session); handleClose(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" style={styles.actionIcon} />
            <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>删除</Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: separatorColor }]} />

          {/* 重命名 */}
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => { onRename(session); handleClose(); }}
          >
            <Ionicons name="pencil-outline" size={20} color={themeColors.text} style={styles.actionIcon} />
            <Text style={[styles.actionLabel, { color: themeColors.text }]}>重命名</Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: separatorColor }]} />

          {/* 置顶 */}
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => { onTogglePin(session); handleClose(); }}
          >
            <Ionicons
              name={session.isPinned ? 'arrow-down' : 'arrow-up'}
              size={20}
              color={themeColors.text}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionLabel, { color: themeColors.text }]}>
              {session.isPinned ? '取消置顶' : '置顶'}
            </Text>
          </TouchableOpacity>

          {/* 底部 安全区 */}
          <View style={styles.bottomSafe} />
        </Animated.View>
      </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  handle: {
    width: 34,
    height: 4,
    borderRadius: 2,
  },
  sessionTitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  actionIcon: {
    marginRight: 14,
    width: 22,
    textAlign: 'center',
  },
  actionLabel: {
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  bottomSafe: {
    height: 44,
  },
  rootView: {
    flex: 1,
  },
});
