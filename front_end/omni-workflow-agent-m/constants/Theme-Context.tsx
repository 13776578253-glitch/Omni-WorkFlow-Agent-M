import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;                     // 用户选择的主题 (未：来自数据库)
  setThemeMode: (mode: ThemeMode) => void;  // 修改主题函数
  effectiveColorScheme: 'light' | 'dark';   // 实际生效主题
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined); //创建上下文

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useNativeColorScheme();                               // 获取手机系统 配置
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');      // 定义状态 存储用户选择主题 /初始 system

  // 初始化时 读取本地
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user_theme_mode');
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    };
    loadTheme();
  }, []);  //空依赖 只加载一次

  // 封装逻辑
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);                                 // 更新内存
    await AsyncStorage.setItem('user_theme_mode', mode);     // 保存到本地
  };

  // 如果用户选了 system，用系统；否则强制用用户选的
  const effectiveColorScheme = themeMode === 'system' 
    ? (systemScheme ?? 'light') 
    : themeMode;

  // 把主题注入 上下文
  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 导出自定义 Hook
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}