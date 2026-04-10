import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AudioModule, setAudioModeAsync } from 'expo-audio';

interface UseAudioPlayerResult {
  currentTime: number;
  totalTime: number;
  audioData: number[];
  isLoading: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
  stopPlay: () => void;
  seekTo: (time: number) => void;
  loadAudio: (uri?: string | null, durationMs?: number | null) => Promise<void>;
}

function createAudioPlayerInstance(uri: string) {
  const source = { uri };
  try {
    const AudioPlayerCtor = AudioModule.AudioPlayer as any;
    return new AudioPlayerCtor(source, 100, false);
  } catch {
    try {
      const AudioPlayerCtor = AudioModule.AudioPlayer as any;
      return new AudioPlayerCtor(source, 100, false, 0);
    } catch (secondaryError) {
      console.error('Failed to create audio player:', secondaryError);
      return null;
    }
  }
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let value = seed || 1;
  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothWaveform(values: number[], radius: number) {
  if (radius <= 0 || values.length <= 2) {
    return values;
  }

  return values.map((_, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(values.length - 1, index + radius);
    let total = 0;
    let count = 0;

    for (let cursor = start; cursor <= end; cursor += 1) {
      total += values[cursor];
      count += 1;
    }

    return total / Math.max(1, count);
  });
}

function createPhraseEnvelopes(
  random: () => number,
  safeDurationSeconds: number
): Array<{
  center: number;
  width: number;
  amplitude: number;
  wobble: number;
  wobblePhase: number;
}> {
  const phraseCount = Math.max(3, Math.min(14, Math.round(safeDurationSeconds / 2.8) + 2));
  const envelopes = [];
  let cursor = 0.04 + random() * 0.04;

  for (let index = 0; index < phraseCount && cursor < 0.96; index += 1) {
    const width = 0.045 + random() * 0.08;
    const gap = 0.018 + random() * 0.05;
    const center = Math.min(0.94, cursor + width * 0.5);
    envelopes.push({
      center,
      width,
      amplitude: 12 + random() * 18,
      wobble: 0.75 + random() * 1.35,
      wobblePhase: random() * Math.PI * 2,
    });
    cursor += width + gap;
  }

  return envelopes;
}

function shapeContrast(value: number, exponent: number) {
  const normalized = Math.max(0, Math.min(1, value));
  return Math.pow(normalized, exponent);
}

function buildPlaceholderWaveform(durationSeconds: number, seedSource = '') {
  const normalizedDuration =
    Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 12;
  const safeDurationSeconds = Math.min(600, normalizedDuration);
  const rawBarCount = Math.round(safeDurationSeconds * 15);
  const barCount = Math.min(9000, Math.max(36, Number.isFinite(rawBarCount) ? rawBarCount : 180));
  const seed = hashString(`${seedSource}|${safeDurationSeconds}|${barCount}`);
  const random = createSeededRandom(seed);
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;
  const phaseC = random() * Math.PI * 2;
  const phraseEnvelopes = createPhraseEnvelopes(random, safeDurationSeconds);
  const spikeCenters = Array.from({ length: Math.max(2, Math.min(7, Math.round(safeDurationSeconds / 5) + 1)) }).map(
    () => 0.08 + random() * 0.84
  );
  const spikeWidths = spikeCenters.map(() => 0.004 + random() * 0.009);
  const spikeWeights = spikeCenters.map(() => 16 + random() * 22);

  const waveform = Array.from({ length: barCount }).map((_, index) => {
    const x = index / Math.max(1, barCount - 1);
    const breathingFloor =
      4.6 +
      Math.sin(x * Math.PI * 1.1 + phaseA) * 1.1 +
      Math.sin(x * Math.PI * 2.8 + phaseB) * 0.8;

    const phrases = phraseEnvelopes.reduce((sum, envelope) => {
      const distance = (x - envelope.center) / envelope.width;
      const bell = Math.exp(-Math.pow(distance, 2));
      const wobble =
        0.54 +
        0.46 * Math.sin(x * Math.PI * 18 * envelope.wobble + envelope.wobblePhase);
      const syllablePulse =
        0.4 +
        Math.abs(Math.sin(x * Math.PI * (26 + envelope.wobble * 4) + envelope.wobblePhase)) * 0.95;
      return sum + bell * envelope.amplitude * wobble * syllablePulse;
    }, 0);

    const spikes = spikeCenters.reduce((sum, center, spikeIndex) => {
      return sum + Math.exp(-Math.pow((x - center) / spikeWidths[spikeIndex], 2)) * spikeWeights[spikeIndex];
    }, 0);

    const syllableTexture =
      Math.abs(Math.sin(x * Math.PI * 34 + phaseC)) * 4.8 +
      Math.abs(Math.sin(x * Math.PI * 57 + phaseB)) * 3.1 +
      Math.abs(Math.sin(x * Math.PI * 81 + phaseA)) * 1.9;
    const microNoise = (random() - 0.5) * 2.4 + (random() - 0.5) * 1.6;
    const edgeFalloff = 0.8 + Math.sin(x * Math.PI) * 0.16;

    const rawValue = (breathingFloor + phrases + spikes + syllableTexture + microNoise) * edgeFalloff;
    const normalized = Math.max(0, Math.min(1, (rawValue - 4) / 52));
    const contrasted =
      shapeContrast(normalized, 0.72) * 38 +
      shapeContrast(normalized, 2.4) * 14;

    return Math.min(58, Math.max(4, contrasted));
  });

  return smoothWaveform(waveform, 1);
}

export function useAudioPlayer(): UseAudioPlayerResult {
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<InstanceType<typeof AudioModule.AudioPlayer> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSyncTimer = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  }, []);

  const syncStatus = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    setCurrentTime(player.currentTime);
    setTotalTime(player.duration || 0);
    setIsPlaying(player.playing);
  }, []);

  useEffect(() => {
    return () => {
      clearSyncTimer();
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, [clearSyncTimer]);

  const createPlayer = useCallback((uri: string) => createAudioPlayerInstance(uri), []);

  const loadAudio = useCallback(async (uri?: string | null, durationMs?: number | null) => {
    clearSyncTimer();
    playerRef.current?.remove();
    playerRef.current = null;

    setCurrentTime(0);
    setIsPlaying(false);

    if (!uri) {
      setTotalTime(durationMs ? durationMs / 1000 : 0);
      setAudioData(buildPlaceholderWaveform(durationMs ? durationMs / 1000 : 12, 'empty-audio'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      const player = createPlayer(uri);
      if (!player) {
        throw new Error('Audio player is unavailable in the current runtime');
      }
      playerRef.current = player;
      console.log('[workflow-audio] loadAudio source', { uri, durationMs });

      const fallbackSeconds =
        typeof durationMs === 'number' && Number.isFinite(durationMs) && durationMs > 0
          ? durationMs / 1000
          : 12;
      setTotalTime(fallbackSeconds);
      setAudioData(buildPlaceholderWaveform(fallbackSeconds, uri));

      syncTimerRef.current = setInterval(() => {
        syncStatus();
      }, 120);

      setTimeout(() => {
        syncStatus();
        const resolvedDuration = player.duration || fallbackSeconds;
        setTotalTime(resolvedDuration);
        setAudioData(buildPlaceholderWaveform(resolvedDuration, uri));
      }, 180);
    } catch (error) {
      console.error('Failed to load audio data:', error);
      setTotalTime(durationMs ? durationMs / 1000 : 0);
      setAudioData(buildPlaceholderWaveform(durationMs ? durationMs / 1000 : 12, uri ?? 'audio-error'));
    } finally {
      setIsLoading(false);
    }
  }, [clearSyncTimer, createPlayer, syncStatus]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (player.currentTime >= player.duration && player.duration > 0) {
      void player.seekTo(0);
      player.play();
      syncStatus();
      return;
    }

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }

    syncStatus();
  }, [syncStatus]);

  const stopPlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    player.pause();
    void player.seekTo(0);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback((time: number) => {
    const player = playerRef.current;
    if (!player) return;

    const duration = player.duration || totalTime;
    const clampedTime = Math.max(0, Math.min(time, duration));
    void player.seekTo(clampedTime);
    setCurrentTime(clampedTime);
  }, [totalTime]);

  return useMemo(() => ({
    currentTime,
    totalTime,
    audioData,
    isLoading,
    isPlaying,
    togglePlay,
    stopPlay,
    seekTo,
    loadAudio,
  }), [audioData, currentTime, isLoading, isPlaying, loadAudio, seekTo, stopPlay, togglePlay, totalTime]);
}

export async function getWorkflowAudioDurationMs(uri?: string | null): Promise<number | null> {
  if (!uri) {
    return null;
  }

  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });

    const player = createAudioPlayerInstance(uri);
    if (!player) {
      return null;
    }

    return await new Promise<number | null>((resolve) => {
      let settled = false;

      const finalize = (durationSeconds?: number | null) => {
        if (settled) return;
        settled = true;
        const safeDurationMs =
          typeof durationSeconds === 'number' &&
          Number.isFinite(durationSeconds) &&
          durationSeconds > 0
            ? Math.round(durationSeconds * 1000)
            : null;
        player.remove();
        resolve(safeDurationMs);
      };

      const firstTimer = setTimeout(() => {
        const duration = player.duration;
        if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
          clearTimeout(secondTimer);
          finalize(duration);
        }
      }, 180);

      const secondTimer = setTimeout(() => {
        clearTimeout(firstTimer);
        finalize(player.duration);
      }, 520);
    });
  } catch {
    return null;
  }
}
