import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height } = Dimensions.get('window');
const RING_COLOR = '#7C7C84';
const RING_COLOR_PRESSED = '#6C6C74';
const BUTTON_CENTER_OFFSET = 290;

interface HomeContentProps {
  translateY: SharedValue<number>;
}

export function HomeContent({ translateY }: HomeContentProps) {
  // Keep prop for upcoming gesture-linked animation work.
  void translateY;

  const cardBg = useThemeColor({}, 'background');
  const titleColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shadowContainer, { backgroundColor: cardBg }]}>
        <View style={styles.innerContent}>
          <View style={styles.heroWrap}>
            <View style={styles.heroDot} />
            <Text style={[styles.heroTitle, { color: titleColor }]}>用户，欢迎回来</Text>
            <Text style={styles.heroSubtitle}>↑ 向上滑动查看详情</Text>
          </View>

          <View style={[styles.ringAnchor, { transform: [{ translateY: BUTTON_CENTER_OFFSET }] }]}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(124,124,132,0.18)', radius: 30 }}
              onPress={() => {}}
              style={({ pressed }) => [styles.ringButtonOuter, pressed && styles.ringButtonOuterPressed]}>
              <View style={[styles.ringButtonInner, { backgroundColor: cardBg }]} />
            </Pressable>
          </View>
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
    bottom: height * 0.109,
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
    marginBottom: -2,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.25,
  },
  heroDot: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#7A7A82',
    fontWeight: '500',
  },
  ringAnchor: {
    position: 'absolute',
    left: '50%',
    marginLeft: -26,
    top: '50%',
  },
  ringButtonOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: RING_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringButtonOuterPressed: {
    backgroundColor: RING_COLOR_PRESSED,
    transform: [{ scale: 0.96 }],
  },
  ringButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
