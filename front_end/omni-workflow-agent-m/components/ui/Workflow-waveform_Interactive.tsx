import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CENTER_OFFSET = SCREEN_WIDTH / 2;

// 核心参数设定（严格对齐时间与物理像素）
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_UNIT = BAR_WIDTH + BAR_GAP;                  // 5px
const BARS_PER_SECOND = 15;                            // 1秒 15根柱子
const PIXELS_PER_SECOND = BARS_PER_SECOND * BAR_UNIT;  // 1秒 = 75px 

interface WorkflowWaveformInteractiveProps {
  // 传入的振幅数组（由你的音频库生成的 0~1 或具体高度的数据）
  audioData: number[]; 
  currentTime?: number;
  totalSeconds: number;
  onTimeChange?: (seconds: number) => void;
  colors: {
    wavePlayed: string;   // 游标左侧（已播）的波形颜色
    waveUnplayed: string; // 游标右侧（未播）的波形颜色
    axisColor: string;
    cursorColor: string;
  };
}

export function formatHms(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor((safeSeconds % 3600) / 60).toString().padStart(2, '0');
  const ss = (safeSeconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`; // 预览音频通常需要显示到秒
}

export function WorkflowWaveformInteractive({
  audioData,
  currentTime,
  totalSeconds,
  onTimeChange,
  colors,
}: WorkflowWaveformInteractiveProps) {
  // 记录滚动距离的动画值
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrollingRef = useRef(false);
  const lastUserTimeRef = useRef<number | null>(null);
  // 时间轴刻度数组 [0, 1, 2, 3...]
  const axisLabels = useMemo(() => {
    return Array.from({ length: Math.ceil(totalSeconds) + 1 }).map((_, i) => i);
  }, [totalSeconds]);

  // 处理滚动事件，同步给父组件当前秒数
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = Math.max(0, e.nativeEvent.contentOffset.x);
      const currentSecond = offsetX / PIXELS_PER_SECOND;
      lastUserTimeRef.current = currentSecond;
      if (onTimeChange) {
        // 为了防止频繁渲染卡顿，只抛出精度到 0.1 的数值，或者在父组件用 useRef 接收
        onTimeChange(Math.min(currentSecond, totalSeconds));
      }
    },
    [onTimeChange, totalSeconds]
  );

  useEffect(() => {
    if (currentTime == null) return;
    if (isUserScrollingRef.current) return;
    if (lastUserTimeRef.current != null && Math.abs(lastUserTimeRef.current - currentTime) < 0.05) return;
    const clamped = Math.max(0, Math.min(currentTime, totalSeconds));
    const targetX = clamped * PIXELS_PER_SECOND;
    scrollRef.current?.scrollTo({ x: targetX, animated: false });
  }, [currentTime, totalSeconds]);

  return (
    <View style={styles.container}>
      {/* 居中固定游标 (绝对定位，不随列表滚动) */}
      <View style={[styles.cursor, { backgroundColor: colors.cursorColor }]} pointerEvents="none">
        <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, top: -6 }]} />
        <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, bottom: -6 }]} />
      </View>

      {/* 滚动区域 */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScrollBeginDrag={() => {
          isUserScrollingRef.current = true;
        }}
        onScrollEndDrag={() => {
          isUserScrollingRef.current = false;
        }}
        onMomentumScrollEnd={() => {
          isUserScrollingRef.current = false;
        }}
        scrollEventThrottle={16} // 16ms 触发一次，保证动画流畅度
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll } // 因为要获取数值，必须设为 false
        )}
        contentContainerStyle={{
          paddingLeft: CENTER_OFFSET,  // 保证0秒在正中间
          paddingRight: CENTER_OFFSET, // 保证最后一秒能滑到正中间
        }}
      >
        <View style={styles.scrollContent}>
          {/* 1. 波形图层 */}
          <View style={styles.waveRow}>
            {audioData.map((h, index) => {
              const xPosition = index * BAR_UNIT;
              
              // 核心逻辑：利用插值，判断柱子在游标左侧还是右侧，动态改变透明度和颜色
              const opacity = scrollX.interpolate({
                inputRange: [xPosition - BAR_UNIT, xPosition],
                outputRange: [0.3, 0.9], // 没滑到时0.3，滑过后0.9
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={`wave-${index}`}
                  style={[
                    styles.waveBar,
                    {
                      height: Math.max(4, h), // 传入的数据h应限制在最大高度内(如 50)
                      backgroundColor: colors.wavePlayed, // 基础颜色
                      opacity: opacity,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* 2. 底层时间轴层 */}
          <View style={styles.axisRow}>
            {axisLabels.map((sec) => (
              <Text
                key={`axis-${sec}`}
                style={[
                  styles.axisText,
                  {
                    color: colors.axisColor,
                    // 绝对定位，严格保证 1秒=75px
                    left: sec * PIXELS_PER_SECOND, 
                  },
                ]}
              >
                {formatHms(sec)}
              </Text>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140, // 预留波形和时间轴的高度
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  waveRow: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -14,
  },
  waveBar: {
    width: BAR_WIDTH,
    marginRight: BAR_GAP,
    borderRadius: 2,
  },
  axisRow: {
    height: 24,
    marginTop: 8,
    position: 'relative',
  },
  axisText: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '500',
    transform: [{ translateX: -15 }], // 文字居中微调，使其对齐刻度线
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 110,
    left: CENTER_OFFSET,
    top: 0,
    marginLeft: -10,
    zIndex: 10,
  },
  cursorDot: {
    position: 'absolute',
    width: 6, // 改小了一点，显得更精致
    height: 6,
    borderRadius: 3,
    left: -2,
  },
});
