import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';
import type { WorkflowShareType } from '@/constants/workflow_share';

import type { HistorySession } from '@/services/history/History_Storage';

const SLIDE_OFFSET = 400;

interface HistoryActionSheetProps {
  session: HistorySession | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (session: HistorySession) => void;
  onRename: (session: HistorySession) => void;
  onTogglePin: (session: HistorySession) => void;
  onShareSelect: (session: HistorySession, shareType: WorkflowShareType) => void;
}

export default function History_ActionSheet({
  session,
  visible,
  onClose,
  onDelete,
  onRename,
  onTogglePin,
  onShareSelect,
}: HistoryActionSheetProps) {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  const translateY = useSharedValue(SLIDE_OFFSET);
  const closingRef = useRef(false);
  const [viewMode, setViewMode] = useState<'actions' | 'share'>('actions');

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
        if (finished) runOnJS(done)();
      }
    );
  }, [translateY]);

  const handleClose = useCallback(() => {
    animateOut(() => {
      closingRef.current = false;
      setViewMode('actions');
      onClose();
    });
  }, [animateOut, onClose]);

  useEffect(() => {
    if (visible) {
      setViewMode('actions');
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
            if (finished) runOnJS(onClose)();
          }
        );
      } else {
        translateY.value = withSpring(0, { damping: 40, stiffness: 400, mass: 0.6 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!session) return null;

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const handleColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';
  const separatorColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const cancelBackground = isDark ? '#2C2C2E' : '#F5F5F5';

  const handleShareTypeSelect = (shareType: WorkflowShareType) => {
    onShareSelect(session, shareType);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.rootView}>
        <Pressable style={styles.overlay} onPress={handleClose} />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, { backgroundColor: cardBg }, sheetStyle]}>
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: handleColor }]} />
            </View>

            {viewMode === 'actions' ? (
              <>
                <Text style={[styles.sessionTitle, { color: themeColors.icon }]} numberOfLines={1}>
                  {session.title}
                </Text>

                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onDelete(session);
                    handleClose();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" style={styles.actionIcon} />
                  <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>删除</Text>
                </TouchableOpacity>

                <View style={[styles.separator, { backgroundColor: separatorColor }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setViewMode('share');
                  }}
                >
                  <Ionicons name="share-social-outline" size={20} color={themeColors.text} style={styles.actionIcon} />
                  <Text style={[styles.actionLabel, { color: themeColors.text }]}>分享</Text>
                </TouchableOpacity>

                <View style={[styles.separator, { backgroundColor: separatorColor }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onRename(session);
                    handleClose();
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color={themeColors.text} style={styles.actionIcon} />
                  <Text style={[styles.actionLabel, { color: themeColors.text }]}>重命名</Text>
                </TouchableOpacity>

                <View style={[styles.separator, { backgroundColor: separatorColor }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onTogglePin(session);
                    handleClose();
                  }}
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
              </>
            ) : (
              <>
                <Text style={[styles.shareTitle, { color: themeColors.icon }]}>分享笔记</Text>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.shareActionButton}
                  onPress={() => handleShareTypeSelect('final_result')}
                >
                  <Text style={[styles.shareActionText, { color: themeColors.text }]}>文档分享</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.shareActionButton}
                  onPress={() => handleShareTypeSelect('session_semantic')}
                >
                  <Text style={[styles.shareActionText, { color: themeColors.text }]}>语义分享</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[styles.cancelShareButton, { backgroundColor: cancelBackground }]}
                  onPress={() => {
                    setViewMode('actions');
                  }}
                >
                  <Text style={[styles.cancelShareText, { color: themeColors.text }]}>取消</Text>
                </TouchableOpacity>
              </>
            )}

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
  shareTitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
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
  shareActionButton: {
    width: '100%',
    paddingVertical: 16,
  },
  shareActionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelShareButton: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 16,
  },
  cancelShareText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSafe: {
    height: 44,
  },
  rootView: {
    flex: 1,
  },
});
