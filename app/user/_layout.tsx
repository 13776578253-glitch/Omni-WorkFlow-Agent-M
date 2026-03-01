import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

export default function UserLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        animation: 'slide_from_right',
        animationDuration: 250,
        headerShown: true,
        headerStyle: { backgroundColor: themeColors.background },
        headerTintColor: themeColors.text,
        contentStyle: { backgroundColor: themeColors.background },
        headerShadowVisible: false,
        headerBackTitle: '返回',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '设置',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 15 }}>
              <Ionicons name="chevron-back" size={26} color={themeColors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="theme"
        options={{
          title: '主题',
          headerStyle: { backgroundColor: themeColors.background },
          contentStyle: { backgroundColor: themeColors.background },
        }}
      />

      <Stack.Screen
        name="personal"
        options={{
          title: '个性化',
          headerStyle: { backgroundColor: themeColors.background },
          contentStyle: { backgroundColor: themeColors.background },
        }}
      />
    </Stack>
  );
}
