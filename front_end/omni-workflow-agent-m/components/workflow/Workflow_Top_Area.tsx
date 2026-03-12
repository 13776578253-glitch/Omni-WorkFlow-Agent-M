import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkflowMode } from '@/constants/workflow_type';

import { formatTimeRange, WorkflowWaveformCountdown } from '@/components/ui/workflow-waveform_countdown';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowTopAreaProps {
  mode: WorkflowMode;
  onHeightChange?: (height: number) => void;
  forcedCompact?: boolean;
}
// 常量定义
export const TOP_AREA_EXPANDED_HEIGHT = 220;     // 展开状态高度
export const TOP_AREA_COMPACT_HEIGHT = 62;       // 紧凑状态高度
const GESTURE_LOCK_DISTANCE = 8;          // 手势锁定最小距离 (px)
const GESTURE_LOCK_RATIO = 1.1;           // 垂直水平手势判断

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// 秒数 转换 / 测试
function getRecordingTimeInfo() {
  const currentSeconds = 0;
  const totalSeconds = 0;
  return { currentSeconds, totalSeconds };
}

export function WorkflowTopArea({ mode, onHeightChange, forcedCompact }: WorkflowTopAreaProps) {
  const bgColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2A2E' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const waveColor = useThemeColor({ light: '#94A3B8', dark: '#8FA0BF' }, 'text');   // 波形图
  const axisColor = useThemeColor({ light: '#6B7280', dark: '#6B7280' }, 'icon');   // 时间轴
  const cursorColor = useThemeColor({ light: '#8FA0BF', dark: '#8FA0BF' }, 'tint'); // 游标

  // 波形图高度 函数 / 测试
  const waveHeights = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, index) => {
        const x = index / 69;
        const burstA = Math.exp(-Math.pow((x - 0.28) / 0.06, 2));
        const burstB = Math.exp(-Math.pow((x - 0.50) / 0.12, 2));
        const burstC = Math.exp(-Math.pow((x - 0.86) / 0.05, 2));
        const base = 8 + (burstA * 30 + burstB * 22 + burstC * 26);
        const ripple = 2 + 8 * Math.abs(Math.sin(index * 0.55));
        return Math.max(6, Math.min(54, base * 0.6 + ripple * 0.4));
      }),
    []
  );

  const [isCompact, setIsCompact] = useState(false);
  const panelHeightAnim = useRef(new Animated.Value(TOP_AREA_EXPANDED_HEIGHT)).current;
  const dragStartHeightRef = useRef(TOP_AREA_EXPANDED_HEIGHT);
  const axisLockRef = useRef<'vertical' | 'horizontal' | null>(null);  // 手势锁定

  // 动画 执行 函数
  const animateTo = useCallback(
    (nextCompact: boolean) => {
      setIsCompact(nextCompact);
      Animated.timing(panelHeightAnim, {
        toValue: nextCompact ? TOP_AREA_COMPACT_HEIGHT : TOP_AREA_EXPANDED_HEIGHT,
        duration: 220,
        useNativeDriver: false,
      }).start();
    },
    [panelHeightAnim]
  );

  // 透明度插值
  const waveOpacity = panelHeightAnim.interpolate({
    inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 20, TOP_AREA_EXPANDED_HEIGHT],
    outputRange: [0, 0.2, 1],
    extrapolate: 'clamp',
  });

  const axisOpacity = panelHeightAnim.interpolate({
    inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 24, TOP_AREA_EXPANDED_HEIGHT],
    outputRange: [0, 0.15, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (forcedCompact && !isCompact) {
      animateTo(true);
    }
  }, [animateTo, forcedCompact, isCompact]);

  useEffect(() => {
    if (!onHeightChange) return;
    const id = panelHeightAnim.addListener(({ value }) => {
      onHeightChange(value);
    });
    return () => {
      panelHeightAnim.removeListener(id);
    };
  }, [onHeightChange, panelHeightAnim]);

  const handleToggleCompact = useCallback(() => {
    if (forcedCompact) {
      animateTo(true);
      return;
    }
    animateTo(!isCompact);
  }, [animateTo, forcedCompact, isCompact]);

  if (mode !== 'recording') return null;

  return (
    // 动画容器
    <Pressable onPress={handleToggleCompact}>
      <Animated.View
        style={[
          styles.container,
          isCompact ? styles.containerCompact : null,
          {
            backgroundColor: bgColor,
            height: panelHeightAnim,
          },
        ]}
      >   
      {/* 录音时长文本  // 测试 */}
      <Text style={[styles.headerTime, isCompact ? styles.headerTimeCompact : null, { color: textColor + 'EA' }]}>
        {formatTimeRange(getRecordingTimeInfo().currentSeconds, getRecordingTimeInfo().totalSeconds)}
      </Text>

      
      {!isCompact ? (
        <WorkflowWaveformCountdown
          waveHeights={waveHeights}
          waveOpacity={waveOpacity}
          axisOpacity={axisOpacity}
          colors={{
            waveColor,
            axisColor,
            cursorColor,
          }}
        />
      ) : null}

      {/* 拖拽手柄 / 测试 */}
      <View style={styles.dragTouchZone}>
        <View style={[styles.dragHandle, { backgroundColor: axisColor + '66' }]} />
      </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  containerCompact: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTime: {
    fontSize: 19,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerTimeCompact: {
    marginBottom: 6,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 3,
    marginTop: 6,
    marginBottom: 2,
  },
  dragTouchZone: {
    alignSelf: 'center',
    width: 120,
    height: 26,
    justifyContent: 'center',
  },
});
