import { Stack } from 'expo-router';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

export default function AssistantLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];
  
  return (
    <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: themeColors.background }, 
      }}>
        
      <Stack.Screen name="index" /> 
      {/* 待添加 */}
    </Stack>
  );
}