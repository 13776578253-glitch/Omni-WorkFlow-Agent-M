import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CENTER_OFFSET = SCREEN_WIDTH / 2;

// 核心参数设定（严格对齐时间与物理像素）
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_UNIT = BAR_WIDTH + BAR_GAP;                  // 5px
const BARS_PER_SECOND = 15;                            // 1秒 15根柱子
const PIXELS_PER_SECOND = BARS_PER_SECOND * BAR_UNIT;  // 1秒 = 75px 

interface WorkflowWaveformTestProps {
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
  return `${mm}:${ss}`;
}

export function formatTimeRange(currentSeconds: number, totalSeconds: number): string {
  return `${formatHms(currentSeconds)}/${formatHms(totalSeconds)}`;
}

// 静态波形组件（只包含波形条，不包含时间轴）
const StaticWaveform = React.memo(({ 
  audioData, 
  color, 
}: { 
  audioData: number[]; 
  color: string;
}) => {
  return (
    <View style={styles.staticContainer}>
      <View style={styles.waveRow}>
        {audioData.map((h, index) => (
          <View
            key={`wave-${index}`}
            style={[
              styles.waveBar,
              {
                height: Math.max(4, h),
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

// 独立的时间轴组件
const StaticAxis = React.memo(({ 
  axisLabels,
  axisColor 
}: { 
  axisLabels: number[];
  axisColor: string;
}) => {
  return (
    <View style={styles.axisRow}>
      {axisLabels.map((sec) => (
        <Text
          key={`axis-${sec}`}
          style={[
            styles.axisText,
            {
              color: axisColor,
              left: sec * PIXELS_PER_SECOND,
            },
          ]}
        >
          {formatHms(sec)}
        </Text>
      ))}
    </View>
  );
});

export function WorkflowWaveformTest({
  audioData,
  currentTime = 0,
  totalSeconds,
  colors,
}: WorkflowWaveformTestProps) {
  // 使用 SharedValue 驱动动画，确保 60fps 流畅度
  const progress = useSharedValue(0);

  // 监听 currentTime 变化，平滑过渡
  useEffect(() => {
    progress.value = withTiming(currentTime, {
      duration: 100, // 与外部更新频率保持一致 (100ms)
      easing: Easing.linear,
    });
  }, [currentTime, progress]);

  // 左侧（已播放）动画样式
  const leftAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: CENTER_OFFSET - progress.value * PIXELS_PER_SECOND }
      ],
    };
  });

  // 右侧（未播放）动画样式
  const rightAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -progress.value * PIXELS_PER_SECOND }
      ],
    };
  });

  // 时间轴动画样式（始终跟随左侧，不被遮罩切割）
  const axisAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: CENTER_OFFSET - progress.value * PIXELS_PER_SECOND }
      ],
    };
  });

  // 预计算时间轴标签
  const axisLabels = useMemo(() => {
    return Array.from({ length: Math.ceil(totalSeconds) + 1 }).map((_, i) => i);
  }, [totalSeconds]);

  return (
    <View style={styles.container}>
      {/* 1. 波形图层 (Masked) */}
      <View style={styles.waveformLayer} pointerEvents="none">
        {/* 左侧遮罩容器：显示高亮波形 (Played) */}
        <View style={styles.leftMask}>
          <Animated.View style={[styles.contentContainer, leftAnimatedStyle]}>
            <StaticWaveform 
              audioData={audioData} 
              color={colors.wavePlayed} 
            />
          </Animated.View>
        </View>

        {/* 右侧遮罩容器：显示暗色波形 (Unplayed) */}
        <View style={styles.rightMask}>
          <Animated.View style={[styles.contentContainer, rightAnimatedStyle]}>
            <StaticWaveform 
              audioData={audioData} 
              color={colors.waveUnplayed} 
            />
          </Animated.View>
        </View>
      </View>

      {/* 2. 时间轴层 (Unmasked, 独立渲染) */}
      <View style={styles.axisLayer} pointerEvents="none">
         <Animated.View style={[styles.contentContainer, axisAnimatedStyle]}>
            <StaticAxis 
              axisLabels={axisLabels} 
              axisColor={colors.axisColor} 
            />
         </Animated.View>
      </View>

      {/* 3. 游标层 */}
      <View style={[styles.cursor, { backgroundColor: colors.cursorColor }]} pointerEvents="none">
        <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, top: -6 }]} />
        <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, bottom: -6 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,    // 增加容器高度，为下方时间轴腾出空间 (原 140 -> 160)
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
    paddingBottom: 20, // 增加底部内边距，防止时间轴贴底
  },
  waveformLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // 仅包含波形高度
    zIndex: 1,
  },
  axisLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40, // 仅包含时间轴高度
    zIndex: 2, // 确保时间轴在波形上方（或下方独立层）
    overflow: 'hidden', // 时间轴不需要左右裁剪，但容器需要裁剪防止溢出屏幕
  },
  leftMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%', // 只显示左半边
    overflow: 'hidden', // 关键：裁剪内容
    zIndex: 2,
  },
  rightMask: {
    position: 'absolute',
    left: '50%', // 从屏幕中间开始
    top: 0,
    bottom: 0,
    width: '50%', // 显示右半边
    overflow: 'hidden', // 关键：裁剪内容
    zIndex: 1,
  },
  contentContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    minWidth: SCREEN_WIDTH, 
    flexDirection: 'column',
    justifyContent: 'center',
  },
  staticContainer: {
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  waveRow: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    // 不需要 marginLeft，通过 transform 控制位置
  },
  waveBar: {
    width: BAR_WIDTH,
    marginRight: BAR_GAP,
    borderRadius: 2,
  },
  axisRow: {
    height: 40, // 增加高度
    marginTop: 0,
    position: 'relative',
    justifyContent: 'center', // 垂直居中
  },
  axisText: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '500',
    top: 5, // 手动指定 top，避免 layout 不确定性
    transform: [{ translateX: -25 }], // 文字居中对齐刻度 (微调：原 -15 -> -17)
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 110,    // 游标高度 (增加高度可以上下延伸)
    left: CENTER_OFFSET,
    top: 0,         // 垂直位置 (负值向上移动，正值向下移动，0 为对齐顶部)
    marginLeft: -12, // 严格居中 (width=2, marginLeft=-1)
    zIndex: 10,
  },
  cursorDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    left: -2,
  },
});
