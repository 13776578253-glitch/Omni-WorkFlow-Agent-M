import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

import { useHomeBackgroundStyle, useHomeMaskStyle } from '@/components/home/Home_Content_bin/Home_Content_Animations';
import { useThemeContext } from '@/constants/Theme-Context';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 背景样式处理 / 待拆分
const LIGHT_BG =
  'https://images.unsplash.com/photo-1532178910-7815d6919875?auto=format&fit=crop&w=1920&q=80';
const DARK_BG =
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1920&q=80';

interface HomeContentProps {
  translateY: SharedValue<number>;
}

// 组件
export function HomeContent({ translateY }: HomeContentProps) {
  const cardBg = useThemeColor({}, 'background');
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const handleColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';

  const backgroundStyle = useHomeBackgroundStyle(translateY);
  const maskStyle = useHomeMaskStyle(translateY);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Animated.Image
          source={{ uri: effectiveColorScheme === 'dark' ? DARK_BG : LIGHT_BG }}
          style={[styles.backgroundImage, backgroundStyle]}
          resizeMode="cover"
        />
      </View>

      <Animated.View style={[styles.maskPanel, { backgroundColor: cardBg }, maskStyle]}>
        {/* 拖动把手 */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
        <View style={[styles.bottomFiller, { backgroundColor: cardBg }]} />
      </Animated.View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  backgroundContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  maskPanel: {
    position: 'absolute',
    bottom: 30,
    width,
    height: height * 0.04,  // 底部遮罩层 / 上限
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    // overflow: 'hidden',
  },
  bottomFiller: {
    position: 'absolute',
    top: 30,            // 边界弧度 / 与  maskPanel/height 有诡异联动 / 锁定逻辑
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    zIndex: -1,
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


});
