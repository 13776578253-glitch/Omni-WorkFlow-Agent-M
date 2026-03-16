import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

type AdaptiveGlassBlurState = {
  useStaticFallback: boolean;
  blurIntensity: number;
};

const FPS_THRESHOLD = 55;
const SAMPLE_WINDOW = 24;

export function useAdaptiveGlassBlur(): AdaptiveGlassBlurState {
  const [useStaticFallback, setUseStaticFallback] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let active = true;
    let rafId: number | null = null;
    let lastTs = Date.now();
    const fpsSamples: number[] = [];

    const tick = () => {
      if (!active) {
        return;
      }

      const now = Date.now();
      const delta = now - lastTs;
      lastTs = now;

      if (delta > 0 && delta < 1000) {
        fpsSamples.push(1000 / delta);
      }

      if (fpsSamples.length >= SAMPLE_WINDOW) {
        const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
        setUseStaticFallback(avgFps < FPS_THRESHOLD);
        fpsSamples.length = 0;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return {
    useStaticFallback,
    blurIntensity: useStaticFallback ? 0 : 34,
  };
}
