import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

type HomeVoiceFloatBallProps = {
  bottom?: number;
  size?: number;
};

export function HomeVoiceFloatBall({ bottom = 56, size = 60 }: HomeVoiceFloatBallProps) {
  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="none">
      <LinearGradient
        colors={['#F7B089', '#A6B9FF']}
        start={{ x: 0.12, y: 0.08 }}
        end={{ x: 0.88, y: 0.92 }}
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerRing,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 24,
  },
  innerRing: {
    borderWidth: 2,
    borderColor: 'rgba(16, 22, 32, 0.88)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
