import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import { TopNavBar } from '@/components/core/top-navbar';
import HomeScreen from './home';
import WorkflowScreen from './workflow';

export default function MainLayout() {
  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useSharedValue(0);
  const position = useSharedValue(0);

  const tabs = [
    { name: '首页', key: 'home' },
    { name: '工作流', key: 'workflow' }
  ];

  const handleTabPress = (index: number) => {
    // setPage 触发平滑滚动动画
    pagerRef.current?.setPage(index);  
  };

  return (
   <View style={styles.container}>
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
          <View style={{flex: 1, backgroundColor: '#121212'}}>
            <HomeScreen />
            
          </View>
        </View>
        <View key="2">
          <View style={{flex: 1, backgroundColor: '#1A1A1A'}}>
            <WorkflowScreen />
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
    backgroundColor: '#000',
  },
  pager: {
    flex: 1,
  },
});