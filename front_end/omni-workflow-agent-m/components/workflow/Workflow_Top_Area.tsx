import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatTimeRange } from '@/components/ui/Workflow-waveform_Interactive';
import type { WorkflowMode } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

import { WorkflowWaveformTest } from '@/components/ui/Workflow-waveform_Test';
import { useAudioPlayer } from '@/services/workflow/Workflow_audio_read';

import { Ionicons } from '@expo/vector-icons';

interface WorkflowTopAreaProps {
  mode: WorkflowMode;
  onHeightChange?: (height: number) => void;
  forcedCompact?: boolean;
}

// 常量定义
export const TOP_AREA_EXPANDED_HEIGHT = 220;        // 展开状态高度
export const TOP_AREA_COMPACT_HEIGHT = 62;          // 紧凑状态高度

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function WorkflowTopArea({ mode, onHeightChange, forcedCompact }: WorkflowTopAreaProps) {
  const bgColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2A2E' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const waveColor = useThemeColor({ light: '#94A3B8', dark: '#8FA0BF' }, 'text');   // 波形图
  const wavePlayedColor = useThemeColor({ light: '#7C3AED', dark: '#A78BFA' }, 'tint'); // 已播放波形 (亮色主题用紫色，暗色主题用浅紫)
  const waveUnplayedColor = useThemeColor({ light: '#E2E8F0', dark: '#3F3F46' }, 'text'); // 未播放波形 (亮色主题用浅灰，暗色主题用深灰)
  
  const axisColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');   // 时间轴
  const cursorColor = useThemeColor({ light: '#7C3AED', dark: '#A78BFA' }, 'tint'); // 游标 (与已播放波形保持一致)

  // 使用自定义 Hook 管理音频播放逻辑
  const {
    currentTime,
    totalTime,
    audioData,
    isLoading,
    isPlaying,
    togglePlay,
    stopPlay,
    loadAudio,
  } = useAudioPlayer();
  
  // 初始化：读取音频数据
  useEffect(() => {
    if (mode === 'recording') { // 这里假设 mode='recording' 是触发场景，实际可能是 'review' 或其他
      loadAudio();
    }
  }, [mode, loadAudio]);

  const [isCompact, setIsCompact] = useState(false);
  const panelHeightAnim = useRef(new Animated.Value(TOP_AREA_EXPANDED_HEIGHT)).current;

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
      {/* 录音时长文本 */}
      {!isCompact ? (
        // 展开模式
        <View>
          <Text style={[styles.headerTime, { color: textColor + 'EA' }]}>
              {isLoading ? 'Loading...' : formatTimeRange(currentTime, totalTime)}
          </Text>
        </View>
      ) : (
        // 收起模式
        <View style={styles.compactRow}>
          <Text style={[styles.headerTime, styles.headerTimeCompact, { color: textColor + 'EA' }]}>
              {isLoading ? '...' : formatTimeRange(currentTime, totalTime)}
          </Text>

          {/* 波形图 - 简单展示部分数据 */}
          <View style={styles.compactWaveRow}>
             {!isLoading && audioData.slice(0, 30).map((h: number, index: number) => {
               // 简单模拟进度：根据当前时间比例计算高亮
               const progressRatio = totalTime > 0 ? currentTime / totalTime : 0;
               const highlightIndex = Math.floor(progressRatio * 30); 
               const isPlayed = index <= highlightIndex;
               
               return (
                <View
                  key={`compact-wave-${index}`}
                  style={[
                    styles.compactWaveBar,
                    {
                      backgroundColor: isPlayed ? waveColor : waveColor + '40', // 已播放高亮，未播放半透明
                      height: Math.max(4, Math.round(h * 0.7)), // 适当调整高度
                      opacity: 0.8,
                    },
                  ]}
                />
               );
             })}
          </View>
          
          {/* 绑定按钮 */}
          <View style={styles.compactActions}>
            <TouchableOpacity style={styles.iconCircle} onPress={togglePlay}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={18} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={stopPlay}>
              <Ionicons name="stop-circle" size={18} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 展开模式 / 使用新的交互式波形组件 */}
      <Animated.View style={{ opacity: waveOpacity }}>
         {!isCompact && !isLoading ? (
           <WorkflowWaveformTest
             audioData={audioData}
             currentTime={currentTime}
             totalSeconds={totalTime}
             onTimeChange={(seconds) => {
               // 这里可以处理拖拽/点击 seek
               // 目前 WorkflowWaveformTest 还没实现手势，但这预留好了
               // seekTo(seconds); 
             }}
             colors={{
               wavePlayed: wavePlayedColor,
               waveUnplayed: waveUnplayedColor,
               axisColor: axisColor,
               cursorColor: cursorColor,
             }}
           />
         ) : null}
      </Animated.View>
      
      {/* Loading Indicator */}
      {isLoading && !isCompact && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={textColor} />
        </View>
      )}

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
    marginBottom: 14,     // 减小间距 (原 20 -> 8)
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