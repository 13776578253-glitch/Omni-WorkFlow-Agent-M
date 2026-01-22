import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import { TopNavBar } from '@/components/core/top-navbar';
import HistoryScreen from './history';
import HomeScreen from './home';
import WorkflowScreen from './workflow';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

export default function MainLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useSharedValue(0);
  const position = useSharedValue(0);

  const tabs = [
    { name: '首页', key: 'home' },
    { name: '工作流', key: 'workflow' },
    { name: '历史', key: 'history' }
  ];

  const handleTabPress = (index: number) => {
    // setPage 触发平滑滚动动画
    pagerRef.current?.setPage(index);  
  };

  return (
   <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* 1. 页面放在下面，内容会延伸到顶部 */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        onPageScroll={(e) => {
          'worklet';
          scrollOffset.value = e.nativeEvent.offset;
          position.value = e.nativeEvent.position;
        }}
      >
        <View key="1">
           {/* 给背景色，方便测试透明导航栏 */}
          <View style={{flex: 1, backgroundColor: themeColors.background}}>
            <HomeScreen />
          </View>
        </View>
        <View key="2">
          <View style={{flex: 1, backgroundColor: themeColors.background}}>
            <WorkflowScreen />
          </View>
        </View>
        <View key="3">
          <View style={{flex: 1, backgroundColor: themeColors.background}}>
            <HistoryScreen />
            </View>
        </View>
      </PagerView>

      {/* 2. 导航栏放在后面，利用 Z-Index 覆盖在 PagerView 之上 */}
      <TopNavBar 
        tabs={tabs}
        scrollOffset={scrollOffset}
        position={position}
        onTabPress={(i) => pagerRef.current?.setPage(i)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
  },
  pager: {
    flex: 1,
  },
});