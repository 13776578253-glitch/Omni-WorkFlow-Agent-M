import { Stack } from 'expo-router';

// 核心路由 类SPA 堆叠切换

// 定义 层级容器
// 标准层级 tabs  /单独界面  name/options
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="details" options={{ title: '详情内容' }} />      */}
    </Stack>
  );
}