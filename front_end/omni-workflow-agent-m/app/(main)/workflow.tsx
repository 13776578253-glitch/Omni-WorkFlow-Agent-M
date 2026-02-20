import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

import { WorkflowContentArea } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions } from '@/components/workflow/Workflow_QuickActions';

// 定义组件属性类型 // 用于控制父组件中 PagerView是否可滑动 
// 半废弃逻辑 / 保留 / 多次测试无法修改pagerview的阻尼并处理多层手势冲突，禁用滑动切换界面逻辑，仅可点击 tab 切换逻辑 
// 仅在此注解
interface WorkflowScreenProps {
  setPagerScrollEnabled: (enabled: boolean) => void;
}

export default function WorkflowScreen({ setPagerScrollEnabled }: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const bgColor = useThemeColor({}, 'background');

  // 监听键盘弹出/收起事件
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setPagerScrollEnabled(false);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setPagerScrollEnabled(true);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [setPagerScrollEnabled]);

  // 计算输入框底部外边距
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  // 基础间距
  let inputBarMarginBottom = insets.bottom + 20;
  // 键盘补偿
  if (Platform.OS === 'android') {
    const androidKeyboardExtra = Math.max(0, keyboardHeight - insets.bottom);
    inputBarMarginBottom += androidKeyboardExtra;
  }

  // const inputBarMarginBottom = insets.bottom + 20 + 
  //   (Platform.OS === 'android' ? Math.max(0, keyboardHeight - insets.bottom) : 0);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/* 内容区 */}
        <WorkflowContentArea />

        {/* 输入区 */}
        <View style={[styles.bottomDock, { backgroundColor: bgColor }]}>
          <View pointerEvents="none" style={[styles.bottomMask, { backgroundColor: bgColor }]} />

          {/* 快捷指令区 */}
          <WorkflowQuickActions />

          {/* 键盘输入/录音 */}
          <WorkflowInputBar
            value={inputText}
            onChangeText={setInputText}
            onSubmit={() => setInputText('')}
            containerStyle={{ marginBottom: inputBarMarginBottom }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomMask: {
    height: 14,     // 补偿高度
    marginTop: -14,
    opacity: 0.55,  // 透明度
  },
  bottomDock: {
    paddingTop: 6,
  },
});
