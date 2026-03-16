import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';

import { useAdaptiveGlassBlur } from '@/components/home/Home_Content_bin/useAdaptiveGlassBlur';

type HomeLayer3GlassProps = {
  bottom: number;
  isDark: boolean;
};

const STATIC_GLASS_TEXTURE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=20';

export function HomeLayer3Glass({ bottom, isDark }: HomeLayer3GlassProps) {
  const { useStaticFallback, blurIntensity } = useAdaptiveGlassBlur();

  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="none">
      {useStaticFallback || Platform.OS === 'web' ? (
        <Image source={{ uri: STATIC_GLASS_TEXTURE }} style={styles.texture} resizeMode="cover" />
      ) : (
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(20,20,22,0.62)' : 'rgba(255,255,255,0.68)' },
        ]}
      />

      <View style={[styles.border, { borderColor: 'rgba(255,255,255,0.36)' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 56,
    right: 56,
    height: 410,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 18,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 24,
  },
});
