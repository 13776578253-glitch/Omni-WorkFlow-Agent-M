import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { WorkflowMode } from '@/constants/workflow_type';

import { WorkflowWaveformInteractive } from '@/components/ui/Workflow-waveform_Interactive';
import { formatTimeRange } from '@/components/ui/workflow-waveform_countdown';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

interface WorkflowTopAreaProps {
  mode: WorkflowMode;
  onHeightChange?: (height: number) => void;
  forcedCompact?: boolean;
}
// 常量定义
export const TOP_AREA_EXPANDED_HEIGHT = 220;     // 展开状态高度
export const TOP_AREA_COMPACT_HEIGHT = 62;       // 紧凑状态高度
// const GESTURE_LOCK_DISTANCE = 8;              // 手势锁定最小距离 (px)
// const GESTURE_LOCK_RATIO = 1.1;               // 垂直水平手势判断

// function clamp(value: number, min: number, max: number) {
//   return Math.min(max, Math.max(min, value));
// }

// 秒数 转换 / 测试
export function WorkflowTopArea({ mode, onHeightChange, forcedCompact }: WorkflowTopAreaProps) {
  const bgColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2A2E' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const waveColor = useThemeColor({ light: '#94A3B8', dark: '#8FA0BF' }, 'text');   // 波形图
  const axisColor = useThemeColor({ light: '#6B7280', dark: '#6B7280' }, 'icon');   // 时间轴
  const cursorColor = useThemeColor({ light: '#8FA0BF', dark: '#8FA0BF' }, 'tint'); // 游标

  // 在 WorkflowTopArea 组件内部添加
  const [currentTime, setCurrentTime] = useState(0);
  // 待处理逻辑
  const [totalTime, setTotalTime] = useState(60); // 假设总时长60秒，实际应从音频库获取

  // 模拟数据  / 待对接  / 测试
  // 模拟音频振幅数据 (正式环境应从后端或前端库获取)
  const interactiveAudioData = useMemo(() => {
    // 1秒15根柱子，60秒就是 900 根
    return Array.from({ length: Math.ceil(totalTime) * 15 }).map(() => 
      Math.random() * 40 + 10 // 生成 10~50 之间的随机高度
    );
  }, [totalTime]);
  
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
  // const dragStartHeightRef = useRef(TOP_AREA_EXPANDED_HEIGHT);
  // const axisLockRef = useRef<'vertical' | 'horizontal' | null>(null);  // 手势锁定

  // 动画 执行 函数
  const animateTo = useCallback(
    (nextCompact: boolean) => {

      // setIsCompact(nextCompact);

      Animated.timing(panelHeightAnim, {
        toValue: nextCompact ? TOP_AREA_COMPACT_HEIGHT : TOP_AREA_EXPANDED_HEIGHT,
        duration: 420,
        useNativeDriver: false,
      }).start(() => {
        // 测试
        // 如果是收起，在动画结束后再设为 true，确保动画过程组件一直存在
        // if (nextCompact) setIsCompact(true);

        setIsCompact(nextCompact);
      });
    },
    [panelHeightAnim]
  );

  // 透明度插值 / 控制显隐 / 待处理
  // const expandedOpacity = panelHeightAnim.interpolate({
  //   inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 20, TOP_AREA_EXPANDED_HEIGHT],
  //   outputRange: [0, 0.2, 1],
  //   extrapolate: 'clamp',
  // });

  // const compactOpacity = panelHeightAnim.interpolate({
  //   inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 24, TOP_AREA_EXPANDED_HEIGHT],
  //   outputRange: [0, 0.15, 1],
  //   extrapolate: 'clamp',
  // });

  // 展开内容的透明度
  const expandedOpacity = panelHeightAnim.interpolate({
    inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 10, TOP_AREA_EXPANDED_HEIGHT],
    // inputRange: [TOP_AREA_COMPACT_HEIGHT , TOP_AREA_EXPANDED_HEIGHT],
    outputRange: [0, 0.2, 1],
    // outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 紧凑内容的透明度
  const compactOpacity = panelHeightAnim.interpolate({
    inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 24, TOP_AREA_EXPANDED_HEIGHT + 40],
    // inputRange: [TOP_AREA_COMPACT_HEIGHT, TOP_AREA_COMPACT_HEIGHT + 40],
    outputRange: [1, 0.15, 0],
    // outputRange: [1, 0],
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

  // 手势判断 / 废弃逻辑 / 保留
  /*
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
          if (forcedCompact) {
            animateTo(true);
            return;
          }
          panelHeightAnim.stopAnimation((v) => {
            const mid = (TOP_AREA_COMPACT_HEIGHT + TOP_AREA_EXPANDED_HEIGHT) / 2;
            const byDragDirection = gestureState.dy < -12 ? true : gestureState.dy > 12 ? false : v <= mid;
            animateTo(byDragDirection);
          });
        },

        // 手势中断
        onPanResponderTerminate: () => {
          if (forcedCompact) {
            animateTo(true);
            return;
          }
          panelHeightAnim.stopAnimation((v) => {
            const mid = (TOP_AREA_COMPACT_HEIGHT + TOP_AREA_EXPANDED_HEIGHT) / 2;
            animateTo(v <= mid);
          });
        },
      }),
    [animateTo, panelHeightAnim]
  );
  */


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
        // isCompact ? styles.containerCompact : null,
        {
          backgroundColor: bgColor,
          height: panelHeightAnim,   // 容器高度动画保持
        },
      ]}
    >

      {/* 展开模式的内容 (渐隐渐现) */}
      <Animated.View 
        style={{ 
          opacity: expandedOpacity,
          // 如果是紧凑模式，这层不挡住下层的点击事件
          pointerEvents: isCompact ? 'none' : 'auto' 
        }}
      >
        {/* 录音时长 - 展开 */}
        <Text style={[styles.headerTime, { color: textColor + 'EA' }]}>
          {formatTimeRange(currentTime, totalTime)}
        </Text>

        {/* 交互波形图 */}
        <WorkflowWaveformInteractive
          audioData={interactiveAudioData}
          currentTime={currentTime}
          totalSeconds={totalTime}
          onTimeChange={(seconds) => {
            setCurrentTime(seconds);
          }}
          colors={{
            wavePlayed: '#3B82F6',
            waveUnplayed: waveColor + '44',
            axisColor,
            cursorColor,
          }}
        />
      </Animated.View>

      {/* 紧凑模式的内容 (绝对定位，重叠在上方) */}
      <Animated.View 
        style={{ 
          opacity: compactOpacity,
          position: 'absolute',       // 绝对定位，让它在动画时浮在展开内容上面
          // top: 12,
          top: 10,                    // 对齐
          left: 16,
          right: 16,
          pointerEvents: isCompact ? 'auto' : 'none'
        }}
      >
        <View style={styles.compactRow}>
          <Text style={[styles.headerTime, styles.headerTimeCompact, { color: textColor + 'EA' }]}>
            {formatTimeRange(currentTime, totalTime)}
          </Text>
          
          <View style={styles.compactWaveRow}>
            {waveHeights.slice(0, 26).map((h, index) => (
              <View
                key={`compact-wave-${index}`}
                style={[
                  styles.compactWaveBar,
                  {
                    backgroundColor: waveColor,
                    height: Math.max(4, Math.round(h * 0.35)),
                    opacity: 0.65,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.compactActions}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => {}}>
              <Ionicons name="pause" size={18} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={() => {}}>
              <Ionicons name="stop-circle" size={18} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* 拖拽手柄  */}
      {/* 仅样式 / 无具体逻辑 */}
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
    overflow: 'hidden',     // 必要
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',   // 测试
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
    fontSize: 17,
    marginBottom: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 2,
  },
  compactWaveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 30,
    marginRight: 8,
    height: 22,
  },
  compactWaveBar: {
    width: 2,
    borderRadius: 2,
  },
  compactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
