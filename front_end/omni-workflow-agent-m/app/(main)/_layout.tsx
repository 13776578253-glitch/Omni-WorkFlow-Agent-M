import React, { useCallback, useEffect, useRef, useState } from 'react'; 
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import { TopNavBar } from '@/components/core/top-navbar';
import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/constants/Theme-Context';

import HistoryScreen from './history';
import HomeScreen from './home';
import WorkflowScreen from './workflow';

export default function MainLayout() {
  // const LOG_TAG = '[KB-Compensate]';  // 测试 导航栏位移 补偿
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  // 初始化 PagerView 引用和动画共享值
  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useSharedValue(0);
  const position = useSharedValue(0);

  // 控制 PagerView 是否允许滑动
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  // 初始化导航栏位移补偿相关变量
  const topNavRef = useRef<any>(null);                           //  导航栏引用，用于测量位置
  const navBaselineYRef = useRef<number | null>(null);           //  存储导航栏 “基准 Y 坐标”
  const [keyboardVisible, setKeyboardVisible] = useState(false); //  标记键盘是否弹出
  const [navCompensation, setNavCompensation] = useState(0);     //  最终的导航栏位移补偿值

  // 定义测量导航栏 Y 坐标的函数
  const measureTopNavY = useCallback((cb: (y: number) => void) => {
    const node = topNavRef.current;
    if (!node || typeof node.measureInWindow !== 'function') {
      // console.log(`${LOG_TAG} measureTopNavY skipped: ref/measureInWindow unavailable`);
      return;
    }
    node.measureInWindow((_x: number, y: number) => cb(y));
  }, []);

  // 监听 Android 键盘显隐事件，计算位移补偿
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // 定义捕获导航栏基准位置的函数
    const captureBaseline = () => {
      requestAnimationFrame(() => {
        measureTopNavY((y) => {
          navBaselineYRef.current = y;
          // console.log(`${LOG_TAG} baselineY=${y}`);
        });
      });
    };

    captureBaseline();  // 初始化

    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      // console.log(`${LOG_TAG} keyboardDidShow`);
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        measureTopNavY((currentY) => {
          const baselineY = navBaselineYRef.current;
          if (baselineY == null) {
            // console.log(`${LOG_TAG} baseline missing `);
            return;
          }
          const delta = baselineY - currentY;
          const compensation = delta > 0 ? delta : 0;
          // console.log(
          //   `${LOG_TAG} currentY=${currentY}, baselineY=${baselineY}, delta=${delta}, compensation=${compensation}`
          // );
          setNavCompensation(compensation);
        });
      });
    });

    // 监听键盘隐藏事件
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      // console.log(`${LOG_TAG} keyboardDidHide -> compensation reset`);
      setKeyboardVisible(false);
      setNavCompensation(0);
      captureBaseline();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [measureTopNavY]);

  // //  监听补偿值/键盘状态变化，打印最终应用的补偿值  / 测试
  // useEffect(() => {
  //   console.log(
  //     `${LOG_TAG} applied translateYCompensation=${keyboardVisible ? navCompensation : 0}, keyboardVisible=${keyboardVisible}`
  //   );
  // }, [keyboardVisible, navCompensation]);

  // 处理抽屉状态变化
  const handleDrawerState = useCallback((isActive: boolean) => {
    setPagerScrollEnabled(!isActive);
  }, []);

  // 处理 PagerView 页面切换事件
  const onPageSelected = useCallback((e: any) => {
    const index = e.nativeEvent.position;
    if (index !== 0) {
      setPagerScrollEnabled(true);
    }
  }, []);

  const tabs = [
    { name: '首页', key: 'home' },
    { name: '工作流', key: 'workflow' },
    { name: '历史', key: 'history' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        scrollEnabled={pagerScrollEnabled}
        onPageSelected={onPageSelected}
        onPageScroll={(e) => {
          'worklet';
          scrollOffset.value = e.nativeEvent.offset;
          position.value = e.nativeEvent.position;
        }}
      >
        <View key="1" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <HomeScreen onDrawerStateChange={handleDrawerState} />
        </View>

        <View key="2" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <WorkflowScreen setPagerScrollEnabled={setPagerScrollEnabled} />
        </View>

        <View key="3" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <HistoryScreen />
        </View>
      </PagerView>

      <TopNavBar
        tabs={tabs}
        scrollOffset={scrollOffset}
        position={position}
        onTabPress={(i) => pagerRef.current?.setPage(i)}
        translateYCompensation={keyboardVisible ? navCompensation : 0}
        containerRef={topNavRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
});
