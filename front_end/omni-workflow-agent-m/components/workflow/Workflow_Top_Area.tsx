import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import type { WorkflowMode } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowTopAreaProps { mode: WorkflowMode; }
// 常量定义
const TOP_AREA_EXPANDED_HEIGHT = 220;     // 展开状态高度
const TOP_AREA_COMPACT_HEIGHT = 62;       // 紧凑状态高度
const GESTURE_LOCK_DISTANCE = 8;          // 手势锁定最小距离 (px)
const GESTURE_LOCK_RATIO = 1.1;           // 垂直水平手势判断

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// 秒数 转换 / 测试
function formatElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function WorkflowTopArea({ mode }: WorkflowTopAreaProps) {
  const bgColor = useThemeColor({}, 'background');
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

  // 手势移动  // 测试
  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 3 || Math.abs(gestureState.dx) > 3,
        
        // 手势开始
        onPanResponderGrant: () => {
          axisLockRef.current = null;
          panelHeightAnim.stopAnimation((v) => {
            dragStartHeightRef.current = v;
          });
        },
        
        //手势移动
        onPanResponderMove: (_evt, gestureState) => {
          if (!axisLockRef.current) {
            const absX = Math.abs(gestureState.dx);
            const absY = Math.abs(gestureState.dy);
            if (absX < GESTURE_LOCK_DISTANCE && absY < GESTURE_LOCK_DISTANCE) return;
            axisLockRef.current = absY > absX * GESTURE_LOCK_RATIO ? 'vertical' : 'horizontal';
          }
          if (axisLockRef.current !== 'vertical') return;
          const nextHeight = clamp(
            dragStartHeightRef.current + gestureState.dy,
            TOP_AREA_COMPACT_HEIGHT,
            TOP_AREA_EXPANDED_HEIGHT
          );
          panelHeightAnim.setValue(nextHeight);
        },

        // 手势释放
        onPanResponderRelease: (_evt, gestureState) => {
          if (axisLockRef.current !== 'vertical') return;
          panelHeightAnim.stopAnimation((v) => {
            const mid = (TOP_AREA_COMPACT_HEIGHT + TOP_AREA_EXPANDED_HEIGHT) / 2;
            const byDragDirection = gestureState.dy < -12 ? true : gestureState.dy > 12 ? false : v <= mid;
            animateTo(byDragDirection);
          });
        },

        // 手势中断
        onPanResponderTerminate: () => {
          panelHeightAnim.stopAnimation((v) => {
            const mid = (TOP_AREA_COMPACT_HEIGHT + TOP_AREA_EXPANDED_HEIGHT) / 2;
            animateTo(v <= mid);
          });
        },
      }),
    [animateTo, panelHeightAnim]
  );

  if (mode !== 'recording') return null;

  return (
    // 动画容器
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
        00:02.45
      </Text>

      {/* 波形图区域  // 测试 */}
      {!isCompact ? (
        <Animated.View style={[styles.waveCanvas, { opacity: waveOpacity }]}>
          <View style={styles.waveRow}>
            {waveHeights.map((h, index) => (
              <View
                key={`top-wave-${index}`}
                style={[
                  styles.waveBar,
                  {
                    backgroundColor: waveColor,
                    height: h,
                    opacity: index > 43 ? 0.28 + ((70 - index) / 70) * 0.5 : 0.9,
                  },
                ]}
              />
            ))}
          </View>

          {/* 中间 游标 */}
          <View style={[styles.cursor, { backgroundColor: cursorColor }]}>
            <View style={[styles.cursorDot, { backgroundColor: cursorColor, top: -6 }]} />
            <View style={[styles.cursorDot, { backgroundColor: cursorColor, bottom: -6 }]} />
          </View>
        </Animated.View>

      ) : null}

      {/* 时间轴区域 */}
      {!isCompact ? (
        <Animated.View style={[styles.axisRow, { opacity: axisOpacity }]}>
          {['00:00', '00:01', '00:02', '00:03', '00:04', '00:05'].map((label) => (
            <Text key={label} style={[styles.axisText, { color: axisColor }]}>
              {label}
            </Text>
          ))}
        </Animated.View>
      ) : null}

      {/* 拖拽手柄 / 测试 */}
      <View style={styles.dragTouchZone} {...dragResponder.panHandlers}>
        <View style={[styles.dragHandle, { backgroundColor: axisColor + '66' }]} />
      </View>
    </Animated.View>
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
  },
  containerCompact: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTime: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerTimeCompact: {
    marginBottom: 6,
  },
  waveCanvas: {
    height: 122,
    justifyContent: 'center',
    marginBottom: 8,
  },
  waveRow: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 96,
    left: '50%',
    top: 13,
    marginLeft: -1,
  },
  cursorDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    left: -5,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  axisText: {
    fontSize: 11,
    fontWeight: '500',
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
