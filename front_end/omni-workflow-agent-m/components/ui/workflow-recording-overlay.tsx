import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WorkflowRecordingOverlayProps {
  isSlideCancelPreview: boolean;
  paddingBottom: number;
  dots: Array<{ key: string; height: number; opacity: number }>;
}

export function WorkflowRecordingOverlay({
  isSlideCancelPreview,
  paddingBottom,
  dots,
}: WorkflowRecordingOverlayProps) {
  const gradientColors = isSlideCancelPreview
    ? ['rgba(239,68,68,0)', 'rgba(239,68,68,0.06)', 'rgba(239,68,68,0.12)'] as const
    : ['rgba(59,130,246,0)', 'rgba(59,130,246,0.05)', 'rgba(59,130,246,0.10)'] as const;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        isSlideCancelPreview ? styles.containerCancel : styles.containerNormal,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. 模糊层：覆盖底部约 1/3 的区域，并使用遮罩感 */}
      <BlurView intensity={20} tint="light" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.5 }]} />
      <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.62 }]} />
      <BlurView intensity={70} tint="dark" style={[StyleSheet.absoluteFill, { top: SCREEN_HEIGHT * 0.74 }]} />

      {/* 3. 内容区域 */}
      <View style={[styles.content, { paddingBottom: paddingBottom + 20 }]}>
        <Text style={[
          styles.recordingHint, 
          isSlideCancelPreview && styles.recordingHintCancel
        ]}>
          {isSlideCancelPreview ? '松手取消发送' : '松手发送，上滑取消'}
        </Text>

        <View style={styles.recordingDotsRow}>
          {dots.map((dot) => (
            <View
              key={dot.key}
              style={[
                styles.recordingDot,
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
    backgroundColor: 'rgba(59,130,246,0.02)',
  },
  containerCancel: {
    backgroundColor: 'rgba(239,68,68,0.03)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  recordingHint: {
    fontSize: 15,
    color: '#FFFFFF', // 图片中文字较亮
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
    gap: 3, // 缩小间距更符合图片
    height: 40, // 固定高度容器使波动居中
  },
  recordingDot: {
    width: 3, // 图片中的线条较细
    borderRadius: 1.5,
  },
  recordingDotNormal: {
    backgroundColor: '#3B82F6', // 亮蓝色
  },
  recordingDotCancel: {
    backgroundColor: '#EF4444',
  },
});
