import { router, Stack } from 'expo-router';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function UserLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];
  
  return (
    <Stack screenOptions={{ 
        presentation: 'card', 
        animation: 'slide_from_right',
        animationDuration: 250,
        headerShown: true,
        headerStyle: { backgroundColor: themeColors.background }, 
        headerTintColor: themeColors.text,
        contentStyle: { backgroundColor: themeColors.background }, 
        headerShadowVisible: false,
        headerBackTitle: "返回",
      }}>

      <Stack.Screen 
        name="index" 
        options={{ 
          title: '设置与账户', 
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ paddingRight: 15 }}
            >
              <Ionicons name="chevron-back" size={26} color={themeColors.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* <Stack.Screen name="auth" options={{ title: '身份验证' }} /> */}

      {/* <Stack.Screen name="language" options={{ title: '语言' }} /> */}

      {/* <Stack.Screen name="module" options={{ title: '模型' }} /> */}

      {/* <Stack.Screen name="contract" options={{ title: '协议' }} /> */}

      <Stack.Screen 
        name="theme" 
        options={{ 
          title: '主题',
          headerStyle: { backgroundColor: themeColors.background },
          contentStyle: { backgroundColor: themeColors.background },
        }} 
      />
    </Stack>
  );
}