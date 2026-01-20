import { useEffect } from 'react';

import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
// import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { ThemeProvider, useThemeContext } from '@/constants/Theme-Context';

function RootStack() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  //  主题变化时，更新安卓原生窗口背景色  // 必要修复
  useEffect(() => {
    const bgColor = Colors[effectiveColorScheme].background;
    SystemUI.setBackgroundColorAsync(bgColor);
  }, [effectiveColorScheme]);
  
  return (
    <>
      {/*状态栏适配 信号、时间图标根据背景变色*/}
      {/* <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />   */}
      
      <Stack 
        // 封装的头部样式
        screenOptions={{ 
          headerBackTitle: '返回',  
          headerShown: false,                   
          headerStyle: {
            backgroundColor: themeColors.background,  // 导航栏背景色
          },
          headerTintColor: themeColors.text,          // 导航栏文字颜色
          headerShadowVisible: false,                 // 隐藏导航栏阴影
          contentStyle: {                             
            backgroundColor: themeColors.background   // 页面内容区背景色
          },
          animation: 'slide_from_right',              // 测试
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="user" options={{ headerShown: false }} />
        <Stack.Screen name="workflow_assistant" options={{ headerShown: false }} />
        {/* <Stack.Screen name="workflow_list" options={{ headerShown: false }} />    */}
        {/* 待添加 */}
      </Stack>
    </>
  );
}

// 提供 全局环境
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}