// 全局根布局
// app/_layout.tsx (最外层)
// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemeProvider, useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

function RootStack() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  return (
    <NavigationThemeProvider
      value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: themeColors.background },
          animationDuration: 250,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="user" />
      </Stack>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1, // 撑满全屏
  },
});