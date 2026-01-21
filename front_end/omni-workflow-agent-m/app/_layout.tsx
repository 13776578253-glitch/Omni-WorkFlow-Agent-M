// 全局根布局
// app/_layout.tsx (最外层)
// app/_layout.tsx
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';

import { ThemeProvider, useThemeContext } from '@/constants/Theme-Context';

function RootStack() {
  const { effectiveColorScheme } = useThemeContext();

  return (
    <NavigationThemeProvider
      value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="user" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
