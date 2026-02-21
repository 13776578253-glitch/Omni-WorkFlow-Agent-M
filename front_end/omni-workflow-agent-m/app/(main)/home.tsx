// app/(main)/user.tsx
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

import { HomeContent } from '@/components/home/Home_Content';
import { HomePortal } from '@/components/home/Home_Portal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MECHANICAL_SPRING = {
  damping: 10,                     // 闃诲凹
  stiffness: 180,                  // 鍒氬害
  mass: 0.8,                       // 璐ㄩ噺
  overshootClamping: true,         // 绂佹瓒呰繃鐩爣鐐癸紝瀹屽叏娑堥櫎鏋滃喕鏅冨姩
  restDisplacementThreshold: 0.01, // 鏋佸皬鐨勪綅绉婚槇鍊硷紝鎻愬墠鍋滄璁＄畻
  restSpeedThreshold: 0.01,        // 鏋佸皬鐨勯€熷害闃堝€?
};

// 瀹氫箟 Props 绫诲瀷
interface HomeScreenProps {
  onDrawerStateChange?: (isActive: boolean) => void;
}

export default function HomeScreen({ onDrawerStateChange }: HomeScreenProps) {
  const bgColor = useThemeColor({}, 'background');
  // const cardColor = useThemeColor({}, 'card'); // 鏃犵敤澹版槑

  const translateY = useSharedValue(0);
  const context = useSharedValue(0);

  const gesture = Gesture.Pan()
    // 璁剧疆婵€娲婚槇鍊? // 鍨傜洿婊戝姩瓒呰繃10鍍忕礌婵€娲绘墜鍔匡紝闃叉杩囨棭瑙﹀彂閿佹
    .activeOffsetY([-10, 10]) 

    // 濡傛按骞崇Щ鍔ㄨ秴杩?0鍍忕礌锛屽垽瀹氫负宸﹀彸鍒囬〉锛屾湰鎵嬪娍澶辫触
    .failOffsetX([-10, 10])

    .onBegin(() => {
      // 閿佹澶栧眰鐨?PagerView锛岀‘淇濆瀭鐩存粦鍔ㄤ笉璇Е宸﹀彸鍒囬〉
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(true);
      }
    })

    .onStart(() => {
      // 鍨傜洿婊戝姩骞惰Е鍙戜綅绉诲悗锛岄€氱煡鐖剁粍浠堕攣瀹?PagerView
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(true);
      }
      // 璁板綍寮€濮嬫粦鍔ㄦ椂鐨勪綅缃?
      context.value = translateY.value;
    })

    .onUpdate((event) => {
      // context.value 璧峰浣?/ event.translationY 鎵嬫寚绉诲姩璺濈
      // let dragResistance = event.translationY > 0 ? 0.4 : 0.85;
      // let nextValue = context.value + (event.translationY * dragResistance);
      // if (nextValue > 0) {
      //   nextValue = nextValue * 0.4;   // 涓嬫媺闃诲凹绯绘暟
      // } else if (nextValue < -SCREEN_HEIGHT) {
      //   const overflow = nextValue + SCREEN_HEIGHT;
      //   nextValue = -SCREEN_HEIGHT + overflow * 0.2;
      // } 
      // translateY.value = nextValue;

      const rawNextValue = context.value + event.translationY;
      let finalValue = rawNextValue;

      if (rawNextValue > 0) {
        // 鍦ㄩ椤电户缁笅鎷夛紙姗＄毊绛嬪洖寮瑰尯锛? 闃诲凹 (0.4)
        finalValue = rawNextValue * 0.4;
      } 
      else if (rawNextValue < -SCREEN_HEIGHT) {
        // 鍦ㄥ姛鑳藉尯缁х画涓婃粦锛堣Е搴曞洖寮瑰尯锛? 闃诲凹 (0.2)
        const overflow = rawNextValue + SCREEN_HEIGHT;
        finalValue = -SCREEN_HEIGHT + (overflow * 0.2);
      } 
      else {
        // 鍦ㄩ椤典笌鍔熻兘鍖轰箣闂存粦鍔紙姝ｅ父鍒囨崲鍖猴級
        if (event.translationY < 0) {
          // 鍚戜笂婊戝姩 / 闃诲姏 (0.65)
          finalValue = context.value + (event.translationY * 0.60);
        } else {
          // 鍚戜笅婊戝姩 / 闃诲姏 (0.80)
          finalValue = context.value + (event.translationY * 0.75);
        }
      }

      translateY.value = finalValue;
    })

    .onEnd((event) => {
      // 鍒嗘柟鍚戦槇鍊?
      const isQuickSwipeDown = event.velocityY > 600;   // 褰撳墠鍦ㄤ笂鏂?蹇€熶笅婊?(Velocity>600) -> 閲婃斁
      const isQuickSwipeUp = event.velocityY < -1000;   // 褰撳墠鍦ㄤ笅鏂?蹇€熶笂婊?(Velocity<-1000) -> 閿佸畾 // 鍚﹀垯鏍规嵁浣嶇疆鏄惁杩囧崐鍒ゅ畾

      // 宸紓鍖栦綅缃槇鍊?
      const thresholdToPortal = -SCREEN_HEIGHT * 0.5;   // 鍘诲姛鑳藉尯 鎷夎繃 50%
      const thresholdBackToHome = -SCREEN_HEIGHT * 0.4; // 浠庡姛鑳藉尯鍥炴潵 鎷夎繃 40%
      // const isPastThreshold = translateY.value < -SCREEN_HEIGHT * 0.55;

      // 鍦ㄦ媺浼哥姸鎬佹澗鎵嬶紝鍥炲脊鍒板垵濮嬩綅 (0)
      if (translateY.value > 0) {
        translateY.value = withSpring(0, MECHANICAL_SPRING);
        return;
      } 
      
      // 鐢ㄦ埛鍦ㄩ《灞備笌搴曞眰涔嬮棿鍒囨崲
      if (isQuickSwipeUp || ( translateY.value < thresholdToPortal && !isQuickSwipeDown)) {
        translateY.value = withSpring(-SCREEN_HEIGHT, MECHANICAL_SPRING);
      } else if ( isQuickSwipeDown || (translateY.value > thresholdBackToHome)){
        translateY.value = withSpring(0, MECHANICAL_SPRING);
      } else {
        translateY.value = withSpring(0, MECHANICAL_SPRING);
      }
    })

    .onFinalize(() => {
      // 鎵嬪娍缁撴潫锛岄噴鏀惧灞傞攣瀹?//閲嶈锛?
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(false);
      }
    });
  
  
  // 棣栭〉鍔ㄧ敾
  const homeStyle = useAnimatedStyle(() => ({ 
    transform: [
      { translateY: translateY.value < 0 ? translateY.value : 0 },
      // { scale: interpolate(
      //   translateY.value, 
      //   [-SCREEN_HEIGHT, 0], 
      //   [1, 1],   // 涓婃粦缂╂斁
      //   Extrapolation.CLAMP
      // )}
      { scale: 1 }
    ],
    // 涓嬫媺鏃朵笉鏀瑰彉閫忔槑搴?
    opacity: interpolate(
      translateY.value, 
      [-SCREEN_HEIGHT, -SCREEN_HEIGHT * 0.5, 0], 
      [0, 1, 1], 
      Extrapolation.CLAMP
    )
    
  }));

  // 鍔熻兘鍖哄姩鐢?
  const portalStyle = useAnimatedStyle(() => ({
    // transform: [{ translateY: translateY.value + SCREEN_HEIGHT }],
    transform: [{ 
    translateY: interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, 0],
      [0, SCREEN_HEIGHT * 0.8], // 鍒濆浣嶇疆鍙笅娌?80%锛屼骇鐢熶氦鍙犳劅锛屽噺灏戠┖鐧?
      Extrapolation.CLAMP
    )
  }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* 搴曞眰锛氬姛鑳藉尯 */}
          <Animated.View style={[styles.layer, styles.portalLayer, portalStyle, { backgroundColor: bgColor }]}>
            {/* 涓嬫媺鎸囩ず鏉?/娴嬭瘯/ */}
            {/* <View style={styles.handleBar} /> */}  
            {/* 搴曢儴 妯″潡 */}
            <HomePortal />
          </Animated.View>

          {/* 椤跺眰锛氶椤靛叆鍙?*/}
          <Animated.View style={[styles.layer, styles.homeLayer, homeStyle, { backgroundColor: bgColor }]}>
            {/* /娴嬭瘯/  */}
            {/* <View style={[styles.lightAvatar, { backgroundColor: cardColor }]} /> */}
            {/* 椤跺眰 妯″潡 */}
            {/* <HomeContent /> */}
            <HomeContent translateY={translateY} />
          </Animated.View>

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  homeLayer: {
    backgroundColor: 'transparent', 
  },
  portalLayer: {
    backgroundColor: '#F5F5F7',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
  },
  lightAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E5E5',
    marginBottom: 15,
  },
  darkUserName: {
    color: '#1D1D1F',
    fontSize: 22,
    fontWeight: '600',
  },
  lightTipText: {
    color: '#86868b',
    marginTop: 8,
  },
  darkText: {
    color: '#1D1D1F',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  lightList: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
  },
  lightItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  }
});
