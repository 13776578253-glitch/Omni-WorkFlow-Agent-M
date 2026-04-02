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

function buildPlaceholderWaveform(durationSeconds: number) {
  const normalizedDuration =
    Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 12;
  const safeDurationSeconds = Math.min(600, normalizedDuration);
  const rawBarCount = Math.round(safeDurationSeconds * 15);
  const barCount = Math.min(9000, Math.max(36, Number.isFinite(rawBarCount) ? rawBarCount : 180));
  return Array.from({ length: barCount }).map((_, index) => {
    const x = index / Math.max(1, barCount - 1);
    const burstA = Math.exp(-Math.pow((x - 0.18) / 0.06, 2));
    const burstB = Math.exp(-Math.pow((x - 0.48) / 0.1, 2));
    const burstC = Math.exp(-Math.pow((x - 0.78) / 0.09, 2));
    const base = 10 + burstA * 34 + burstB * 28 + burstC * 30;
    const texture = 4 + ((index * 7) % 9);
    return Math.min(50, Math.max(5, base * 0.5 + texture));
  });
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

  const createPlayer = useCallback((uri: string) => {
    const source = { uri };
    try {
      const AudioPlayerCtor = AudioModule.AudioPlayer as any;
      return new AudioPlayerCtor(source, 100, false);
    } catch (error) {
      try {
        const AudioPlayerCtor = AudioModule.AudioPlayer as any;
        return new AudioPlayerCtor(source, 100, false, 0);
      } catch (secondaryError) {
        console.error('Failed to create audio player:', secondaryError);
        return null;
      }
    }
  }, []);

  const loadAudio = useCallback(async (uri?: string | null, durationMs?: number | null) => {
    clearSyncTimer();
    playerRef.current?.remove();
    playerRef.current = null;

    setCurrentTime(0);
    setIsPlaying(false);

    if (!uri) {
      setTotalTime(durationMs ? durationMs / 1000 : 0);
      setAudioData(buildPlaceholderWaveform(durationMs ? durationMs / 1000 : 12));
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
      setAudioData(buildPlaceholderWaveform(fallbackSeconds));

      syncTimerRef.current = setInterval(() => {
        syncStatus();
      }, 120);

      setTimeout(() => {
        syncStatus();
        const resolvedDuration = player.duration || fallbackSeconds;
        setTotalTime(resolvedDuration);
        setAudioData(buildPlaceholderWaveform(resolvedDuration));
      }, 180);
    } catch (error) {
      console.error('Failed to load audio data:', error);
      setTotalTime(durationMs ? durationMs / 1000 : 0);
      setAudioData(buildPlaceholderWaveform(durationMs ? durationMs / 1000 : 12));
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
