import { Stack } from 'expo-router';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

export default function UserLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];
  
  return (
    <Stack screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: themeColors.background }, 
        headerTintColor: themeColors.text,
        contentStyle: { backgroundColor: themeColors.background }, 
      }}>

      <Stack.Screen name="auth" options={{ title: '身份验证' }} />

      {/* <Stack.Screen name="language" options={{ title: '语言' }} /> */}
      <Stack.Screen name="theme" options={{ title: '主题' }} />
      {/* <Stack.Screen name="module" options={{ title: '模型' }} /> */}

      {/* <Stack.Screen name="contract" options={{ title: '协议' }} /> */}
    </Stack>
  );
}