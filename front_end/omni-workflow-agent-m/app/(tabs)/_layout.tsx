import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Tabs } from 'expo-router';

export default function TabLayout() {

  const activeColor = useThemeColor({}, 'tint');        // 选中色
  const bgColor = useThemeColor({}, 'background');      // 背景色
  const textColor = useThemeColor({}, 'text');          // 文字色
  const borderColor = useThemeColor({}, 'tabBorder');   // 边框色

  return (
    <Tabs screenOptions= {{ 
        tabBarActiveTintColor: activeColor,
        tabBarStyle: { 
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          // borderTopWidth: 0,      
          elevation: 0,           
        }, 
        headerStyle: { backgroundColor: bgColor },
        headerTintColor: textColor,
      }}>  
      <Tabs.Screen
        name="home"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <IconSymbol name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workflow"
        options={{
          title: '工作流',
          tabBarIcon: ({ color }) => <IconSymbol name="rebase-edit" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: '用户',
          tabBarIcon: ({ color }) => <IconSymbol name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}