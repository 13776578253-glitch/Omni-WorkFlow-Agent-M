import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient'; //  线性渐变 组件

import { useThemeColor } from '@/hooks/use-theme-color';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WorkflowRecordingOverlayProps {
  isSlideCancelPreview: boolean;
  paddingBottom: number;
  dots: Array<{ key: string; height: number; opacity: number }>;   // 波形 原点数组
}

export function WorkflowRecordingOverlay({
  isSlideCancelPreview,
  paddingBottom,
  dots,
}: WorkflowRecordingOverlayProps) {
  const hintNormalColor = useThemeColor({ light: 'rgba(31,41,55,0.82)', dark: 'rgba(255,255,255,0.86)' }, 'text');
  const hintCancelColor = useThemeColor({ light: '#B91C1C', dark: '#F87171' }, 'text');

  // 渐变背景 颜色
  const gradientColors = isSlideCancelPreview
    ? ['rgba(239,68,68,0)', 'rgba(239,68,68,0.01)', 'rgba(239,68,68,0.03)', 'rgba(239,68,68,0.06)'] as const
    : ['rgba(59,130,246,0)', 'rgba(59,130,246,0.008)', 'rgba(59,130,246,0.02)', 'rgba(59,130,246,0.045)'] as const;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        // 背景色切换
        isSlideCancelPreview ? styles.containerCancel : styles.containerNormal,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.28, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 模糊层：遮罩 */}
      <BlurView intensity={12} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.36 }]} />
      <BlurView intensity={20} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.46 }]} />
      <BlurView intensity={30} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.56 }]} />
      <BlurView intensity={42} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.66 }]} />
      <BlurView intensity={56} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.74 }]} />
      <BlurView intensity={72} tint="default" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.82 }]} />

      {/* 内容区 */}
      <View style={[styles.content, { paddingBottom: paddingBottom + 20 }]}>
        <Text style={[
          styles.recordingHint, 
          { color: isSlideCancelPreview ? hintCancelColor : hintNormalColor },
          isSlideCancelPreview && styles.recordingHintCancel
        ]}>
          {isSlideCancelPreview ? '松手取消发送' : '松手发送，上滑取消'}
        </Text>

        {/* 波形渲染层 */}
        <View style={styles.recordingDotsRow}>
          {dots.map((dot) => (
            <View
              key={dot.key}
              style={[
                styles.recordingDot,
                // 状态相关 原点颜色
                isSlideCancelPreview ? styles.recordingDotCancel : styles.recordingDotNormal,
                { 
                  height: Math.max(4, dot.height), // 确保最小高度
                  opacity: dot.opacity 
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  containerNormal: {
    backgroundColor: 'rgba(59,130,246,0.004)',
  },
  containerCancel: {
    backgroundColor: 'rgba(239,68,68,0.006)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  recordingHint: {
    fontSize: 15,
    color: '#FFFFFF', 
    opacity: 0.8,
    marginBottom: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  recordingHintCancel: {
    color: '#FF4D4F',
    opacity: 1,
  },
  recordingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '78%',
    gap: 3,          // 间距
    height: 40,      // 固定高度容器 / 使波动居中
  },
  recordingDot: {
    width: 3, 
    borderRadius: 1.5,
  },
  recordingDotNormal: {
    backgroundColor: '#3B82F6',  // 亮蓝色
  },
  recordingDotCancel: {
    backgroundColor: '#EF4444',
  },
});
