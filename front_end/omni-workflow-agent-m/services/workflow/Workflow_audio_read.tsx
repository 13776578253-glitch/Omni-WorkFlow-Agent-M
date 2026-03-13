import { useCallback, useEffect, useRef, useState } from 'react';

// 模拟后端返回的音频数据结构
export interface AudioData {
  id: string;
  duration: number; // 秒
  waveform: number[]; // 波形振幅数据 (0-100)
}

// 模拟 12s 音频数据
// 15 bars/sec * 12 sec = 180 bars
const MOCK_AUDIO_DATA: AudioData = {
  id: 'mock-audio-001',
  duration: 12,
  waveform: Array.from({ length: 180 }).map((_, index) => {
    // 生成一些随机但看起来像波形的数据
    const x = index / 179;
    // 几个波峰
    const burstA = Math.exp(-Math.pow((x - 0.2) / 0.05, 2));
    const burstB = Math.exp(-Math.pow((x - 0.5) / 0.1, 2));
    const burstC = Math.exp(-Math.pow((x - 0.8) / 0.08, 2));
    
    const base = 10 + (burstA * 40 + burstB * 30 + burstC * 35);
    const noise = Math.random() * 10;
    
    return Math.min(100, Math.max(5, base + noise));
  })
};

// 模拟异步读取音频服务
export const WorkflowAudioService = {
  // 模拟从后端获取音频数据
  getAudioData: async (): Promise<AudioData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_AUDIO_DATA);
      }, 500); // 模拟 500ms 网络延迟
    });
  }
};

interface UseAudioPlayerResult {
  currentTime: number;
  totalTime: number;
  audioData: number[];
  isLoading: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
  stopPlay: () => void;
  seekTo: (time: number) => void;
  loadAudio: () => Promise<void>;
}

// 封装音频播放逻辑的自定义 Hook
export function useAudioPlayer(): UseAudioPlayerResult {
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);
  const [totalTime, setTotalTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 加载音频数据
  const loadAudio = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await WorkflowAudioService.getAudioData();
      setTotalTime(data.duration);
      // 预处理波形数据，缩放到 0-50 高度
      const processedWave = data.waveform.map(h => Math.min(50, h * 0.5));
      setAudioData(processedWave);
      // 加载完成后自动播放
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to load audio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 播放控制逻辑
  useEffect(() => {
    if (!isPlaying || totalTime === 0) return;

    const interval = setInterval(() => {
      if (currentTimeRef.current >= totalTime) {
        setIsPlaying(false); // 播放结束
        clearInterval(interval);
        return;
      }
      
      const nextTime = Math.min(currentTimeRef.current + 0.1, totalTime);
      currentTimeRef.current = nextTime;
      
      // 只有在 UI 需要显示时间或者处理交互时才更新 state
      setCurrentTime(nextTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, totalTime]);

  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    if (currentTimeRef.current >= totalTime) {
      // 如果已经播放结束，重置并重新播放
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [totalTime]);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    currentTimeRef.current = 0;
    setCurrentTime(0);
  }, []);

  const seekTo = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, totalTime));
    currentTimeRef.current = clampedTime;
    setCurrentTime(clampedTime);
  }, [totalTime]);

  return {
    currentTime,
    totalTime,
    audioData,
    isLoading,
    isPlaying,
    togglePlay,
    stopPlay,
    seekTo,
    loadAudio,
  };
}
