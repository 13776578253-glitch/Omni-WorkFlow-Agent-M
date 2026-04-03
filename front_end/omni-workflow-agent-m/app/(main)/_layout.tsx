import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import { TopNavBar } from '@/components/core/top-navbar';

import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/constants/Theme-Context';
import type { WorkflowShareType } from '@/constants/workflow_share';

import { SessionManager } from '@/services/workflow/Session_Manager';
import { shareWorkflowSessionPayload } from '@/services/workflow/Workflow_Share_Builder';

import HistoryScreen from './history';
import HomeScreen from './home';
import WorkflowScreen from './workflow';

export default function MainLayout() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useSharedValue(0);
  const position = useSharedValue(0);

  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWorkflowSessionId, setCurrentWorkflowSessionId] = useState<string | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [workflowResetToken, setWorkflowResetToken] = useState(0);
  const [pendingWorkflowInput, setPendingWorkflowInput] = useState<string | null>(null);
  const [pendingWorkflowSubmitToken, setPendingWorkflowSubmitToken] = useState(0);
  const ENABLE_PAGER_SWIPE = false;

  const topNavRef = useRef<any>(null);
  const navBaselineYRef = useRef<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [navCompensation, setNavCompensation] = useState(0);

  const measureTopNavY = useCallback((cb: (y: number) => void) => {
    const node = topNavRef.current;
    if (!node || typeof node.measureInWindow !== 'function') {
      return;
    }
    node.measureInWindow((_x: number, y: number) => cb(y));
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const captureBaseline = () => {
      requestAnimationFrame(() => {
        measureTopNavY((y) => {
          navBaselineYRef.current = y;
        });
      });
    };

    // 初始化
    captureBaseline();

    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        measureTopNavY((currentY) => {
          const baselineY = navBaselineYRef.current;
          if (baselineY == null) {
            return;
          }
          const delta = baselineY - currentY;
          const compensation = delta > 0 ? delta : 0;
          setNavCompensation(compensation);
        });
      });
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setNavCompensation(0);
      captureBaseline();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [measureTopNavY]);

  // 初始化当前会话 ID
  useEffect(() => {
    const initCurrentSession = async () => {
      const sessionId = await SessionManager.getCurrentSessionId();
      setCurrentWorkflowSessionId(sessionId);
    };
    void initCurrentSession();
  }, []);

  const handleDrawerState = useCallback((isActive: boolean) => {
    setPagerScrollEnabled(!isActive);
  }, []);

  const onPageSelected = useCallback((e: any) => {
    const index = e.nativeEvent.position;
    setActiveTabIndex(index);
    if (index !== 0) {
      setPagerScrollEnabled(true);
    }
  }, []);

  // 加载会话列表
  const handleTabPress = useCallback((index: number) => {
    setActiveTabIndex(index);
    pagerRef.current?.setPage(index);
  }, []);
  
  // 新建工作流
  const handleNewWorkflow = useCallback(async () => {
    await SessionManager.clearCurrentSessionId();
    setCurrentWorkflowSessionId(null);
    setWorkflowResetToken((prev) => prev + 1);
    setActiveTabIndex(1);
    pagerRef.current?.setPage(1);
  }, []);

  // 打开历史会话
  const handleOpenWorkflowSession = useCallback(async (sessionId: string) => {
    await SessionManager.setCurrentSessionId(sessionId);
    setCurrentWorkflowSessionId(sessionId);
    setActiveTabIndex(1);
    pagerRef.current?.setPage(1);
  }, []);

  // 监听历史变更，刷新列表
  const handleHistoryChanged = useCallback(() => {
    setHistoryRefreshToken((prev) => prev + 1);
  }, []);

  const handleStartWorkflowFromHome = useCallback(async (transcriptText: string) => {
    await SessionManager.clearCurrentSessionId();
    setCurrentWorkflowSessionId(null);
    setWorkflowResetToken((prev) => prev + 1);
    setPendingWorkflowInput(transcriptText);
    setPendingWorkflowSubmitToken((prev) => prev + 1);
    setActiveTabIndex(1);
    pagerRef.current?.setPage(1);
  }, []);

  // 处理分享会话事件，根据用户选择的分享类型调用对应的分享函数
  const handleWorkflowShareByType = useCallback(async (shareType: WorkflowShareType) => {
    if (!currentWorkflowSessionId) {
      Alert.alert('无法分享', '当前还没有可分享的会话。');
      return;
    }

    try {
      await shareWorkflowSessionPayload({
        sessionId: currentWorkflowSessionId,
        shareType,
      });
    } catch {
      Alert.alert('分享失败', '暂时无法导出这个会话，请稍后重试。');
    }
  }, [currentWorkflowSessionId]);

  const handleWorkflowSharePress = useCallback(() => {
    if (!currentWorkflowSessionId) {
      Alert.alert('无法分享', '当前还没有可分享的会话。');
      return;
    }

    Alert.alert('分享会话', '选择要分享的内容类型', [
      {
        text: '最终结果',
        onPress: () => {
          void handleWorkflowShareByType('final_result');
        },
      },
      {
        text: '语义会话',
        onPress: () => {
          void handleWorkflowShareByType('session_semantic');
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  }, [currentWorkflowSessionId, handleWorkflowShareByType]);

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
        scrollEnabled={ENABLE_PAGER_SWIPE && pagerScrollEnabled}
        onPageSelected={onPageSelected}
        onPageScroll={(e) => { 'worklet';
          scrollOffset.value = e.nativeEvent.offset;
          position.value = e.nativeEvent.position;
        }}
      >
        <View key="1" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <HomeScreen
            onDrawerStateChange={handleDrawerState}
            onStartWorkflowFromHome={handleStartWorkflowFromHome}
          />
        </View>

        <View key="2" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <WorkflowScreen
            currentSessionId={currentWorkflowSessionId}
            onHistoryChanged={handleHistoryChanged}
            onSessionChange={setCurrentWorkflowSessionId}
            resetToken={workflowResetToken}
            setPagerScrollEnabled={setPagerScrollEnabled}
            pendingExternalInput={pendingWorkflowInput}
            pendingExternalSubmitToken={pendingWorkflowSubmitToken}
          />
        </View>

        <View key="3" style={{ flex: 1, backgroundColor: themeColors.background }}>
          <HistoryScreen
            onOpenSession={handleOpenWorkflowSession}
            refreshToken={historyRefreshToken}
            searchQuery={searchQuery}
          />
        </View>
      </PagerView>

      <TopNavBar
        tabs={tabs}
        scrollOffset={scrollOffset}
        position={position}
        onTabPress={handleTabPress}
        activeTabIndex={activeTabIndex}
        translateYCompensation={keyboardVisible ? navCompensation : 0}
        containerRef={topNavRef}
        onSearchSubmit={setSearchQuery}
        onNewWorkflowPress={handleNewWorkflow}
        onWorkflowSharePress={currentWorkflowSessionId ? handleWorkflowSharePress : undefined}
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
