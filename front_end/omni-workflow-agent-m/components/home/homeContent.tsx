import React from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeContentProps {
  translateY: SharedValue<number>;
}

export function HomeContent({ translateY }: HomeContentProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'background');

  // 背景拉伸动画：当向下拉 (translateY > 0) 时，图片放大
  const backgroundStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, 150], // 下拉 150 像素
      [1, 1.2], // 图片放大到 1.2 倍
      Extrapolation.CLAMP
    );

    // 让图片在放大时稍微向下平移一点，增加视觉深度的拉伸感
    // const imageTranslateY = interpolate(
    //   translateY.value,
    //   [0, 150],
    //   [0, 20],
    //   Extrapolate.CLAMP
    // );

    return {
      transform: [
        { scale },
        // { translateY: imageTranslateY }
      ],
    };
  });

  const maskStyle = useAnimatedStyle(() => {
    // 蒙版面板（白色卡片区）在下拉时，可以稍微向下挪一点，露出更多背景
    const maskMove = interpolate(
      translateY.value,
      [0, 150],
      [0, 40], // 蒙版向下移 40px
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY: maskMove }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 背景图：撑满上半部分 */}
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' }}
          style={[styles.backgroundImage, backgroundStyle]}
          resizeMode="cover"
        />
      </View>

      {/* 蒙版面板：压在背景上面 */}
      <Animated.View style={[styles.maskPanel, { backgroundColor: cardBg }, maskStyle]}>
        <View style={styles.contentPadding}>
          {/* 这里只保留你要求的“今天要从哪里开始”大框 */}
          <View style={[styles.largeSearchBox, { backgroundColor: textColor + '08' }]}>
            <View style={[styles.iconBox, { backgroundColor: textColor }]}>
              <ThemedText style={{ color: cardBg, fontWeight: 'bold' }}>L</ThemedText>
            </View>
            <ThemedText style={[styles.largePlaceholder, { color: textColor + '80' }]}>
              今天要从哪里开始？
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 强制占满全屏，不要 padding
  },
  imageContainer: {
    width: width,
    height: SCREEN_HEIGHT * 0.7, // 占据上方约 2/3
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  maskPanel: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: SCREEN_HEIGHT * 0.45, // 覆盖下方并向上延伸一部分
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    // 增加阴影，产生覆盖在背景上的感觉
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  contentPadding: {
    padding: 30,
    flex: 1,
  },
  logoBox: {
    width: 60,
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  largeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    width: '100%',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  largePlaceholder: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});