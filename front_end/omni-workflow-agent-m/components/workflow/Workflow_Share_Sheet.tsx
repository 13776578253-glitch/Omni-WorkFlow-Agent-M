import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WorkflowShareType } from '@/constants/workflow_share';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

interface WorkflowShareSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (shareType: WorkflowShareType) => void;
}

const SLIDE_OFFSET = 400;

export function WorkflowShareSheet({
  visible,
  title = '分享笔记',
  onClose,
  onSelect,
}: WorkflowShareSheetProps) {
  const insets = useSafeAreaInsets();
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];
  const isDark = effectiveColorScheme === 'dark';

  const sheetBackgroundColor = isDark ? themeColors.card : '#FFFFFF';
  const titleColor = isDark ? themeColors.icon : '#999999';
  const actionTextColor = isDark ? themeColors.text : '#333333';
  const cancelBackgroundColor = isDark ? '#2C2C2E' : '#F5F5F5';
  const handleColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';

  const translateY = useSharedValue(SLIDE_OFFSET);
  const closingRef = useRef(false);

  const animateIn = useCallback(() => {
    closingRef.current = false;
    translateY.value = SLIDE_OFFSET;
    translateY.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
  }, [translateY]);

  const animateOut = useCallback((done: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    translateY.value = withTiming(
      SLIDE_OFFSET,
      { duration: 220, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(done)();
        }
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
    if (visible) {
      animateIn();
    }
  }, [animateIn, visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 500) {
        translateY.value = withTiming(
          SLIDE_OFFSET,
          { duration: 200, easing: Easing.in(Easing.quad) },
          (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          }
        );
      } else {
        translateY.value = withSpring(0, { damping: 40, stiffness: 400, mass: 0.6 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSelect = (shareType: WorkflowShareType) => {
    handleClose();
    onSelect(shareType);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleClose} />

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              {
                backgroundColor: sheetBackgroundColor,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: handleColor }]} />
            </View>

            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.actionButton}
              onPress={() => handleSelect('final_result')}
            >
              <Text style={[styles.actionText, { color: actionTextColor }]}>文档分享</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.actionButton}
              onPress={() => handleSelect('session_semantic')}
            >
              <Text style={[styles.actionText, { color: actionTextColor }]}>语义分享</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.cancelButton, { backgroundColor: cancelBackgroundColor }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: actionTextColor }]}>取消</Text>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  handleWrap: {
    alignItems: 'center',
    marginTop: -17,
    paddingBottom: 10,
  },
  handle: {
    width: 34,
    height: 4,
    borderRadius: 2,
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelButton: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 16,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});
