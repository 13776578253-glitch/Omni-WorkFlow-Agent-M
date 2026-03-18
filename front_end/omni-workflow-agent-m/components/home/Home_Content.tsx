import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height } = Dimensions.get('window');

interface HomeContentProps {
  translateY: SharedValue<number>;
}

export function HomeContent({ translateY }: HomeContentProps) {
  // 获取主题背景色
  const cardBg = useThemeColor({}, 'background');
  
  // 获取动画样式
  // const maskStyle = useHomeMaskStyle(translateY);

  return (
    <View style={styles.container}>
      {/* 外层 */}
      <Animated.View style={[
        styles.shadowContainer, 
        // maskStyle, 
        { backgroundColor: cardBg } 
        
      ]}> 
        
        {/* 内层 */}
        <View style={styles.innerContent}>
          {/* 待添加内容 */}
        </View>
        
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
    overflow: 'visible',
  },
  shadowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: height * 0.109,   // sb 
    // height: height * 0.89,

    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  innerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // 往下拉 2 个像素，确保物理渲染时内层颜色绝对能盖住外层边缘 // 没用
    marginBottom: -2, 
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  }
});