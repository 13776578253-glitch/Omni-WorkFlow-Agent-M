import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { WorkflowMode } from '@/constants/workflow_type';

import { formatTimeRange } from '@/components/ui/workflow-waveform_countdown';
import { WorkflowWaveformInteractive } from '@/components/ui/Workflow-waveform_Interactive';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

interface WorkflowTopAreaProps {
  mode: WorkflowMode;
  onHeightChange?: (height: number) => void;
  forcedCompact?: boolean;
}

// 常量定义
export const TOP_AREA_EXPANDED_HEIGHT = 220;        // 展开状态高度
export const TOP_AREA_COMPACT_HEIGHT = 62;          // 紧凑状态高度
// const GESTURE_LOCK_DISTANCE = 8;                 // 手势锁定最小距离 (px)
// const GESTURE_LOCK_RATIO = 1.1;                  // 垂直水平手势判断

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

  // 转换为音频数据格式（0-50范围）
  const audioData = useMemo(() => 
    waveHeights.map(h => Math.min(50, h * 0.8)), // 适当缩放
    [waveHeights]
  );

  const [isCompact, setIsCompact] = useState(false);
  const panelHeightAnim = useRef(new Animated.Value(TOP_AREA_EXPANDED_HEIGHT)).current;
  // const dragStartHeightRef = useRef(TOP_AREA_EXPANDED_HEIGHT);
  // const axisLockRef = useRef<'vertical' | 'horizontal' | null>(null);  // 手势锁定

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

  // 获取录音时间信息
  const recordingTimeInfo = useMemo(() => getRecordingTimeInfo(), []);

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
      {/* 录音时长文本 */}
      {!isCompact ? (
        // 展开模式  // 时长样式
        <Text style={[styles.headerTime, { color: textColor + 'EA' }]}>
          {formatTimeRange(recordingTimeInfo.currentSeconds, recordingTimeInfo.totalSeconds)}
        </Text>
      ) : (
        // 收起模式 //样式
        <View style={styles.compactRow}>
          {/* 时长样式 */}
          <Text style={[styles.headerTime, styles.headerTimeCompact, { color: textColor + 'EA' }]}>
            {formatTimeRange(recordingTimeInfo.currentSeconds, recordingTimeInfo.totalSeconds)}
          </Text>

          {/* 波形图 */}
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
          
          {/* 绑定按钮 */}
          <View style={styles.compactActions}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => {}}>
              <Ionicons name="pause" size={18} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={() => {}}>
              <Ionicons name="stop-circle" size={18} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 展开模式 / 使用新的交互式波形组件 */}
      {!isCompact ? (
        <WorkflowWaveformInteractive
          audioData={audioData}
          currentTime={recordingTimeInfo.currentSeconds}
          totalSeconds={recordingTimeInfo.totalSeconds}
          onTimeChange={(seconds) => {
            // 这里可以处理时间变化，例如更新录音进度
            console.log('Waveform time changed:', seconds);
          }}
          colors={{
            wavePlayed: waveColor,
            waveUnplayed: waveColor + '80', // 未播放部分半透明
            axisColor: axisColor,
            cursorColor: cursorColor,
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
    fontSize: 17,        // 展开样式
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,    // 文字间距
  },
  headerTimeCompact: {
    fontSize: 16,        // 缩小样式
    marginBottom: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7,        // 绝对高度
    paddingBottom: 10,     // 无用样式
  },
  // 收起状态 / 波形图样式
  compactWaveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 38,
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