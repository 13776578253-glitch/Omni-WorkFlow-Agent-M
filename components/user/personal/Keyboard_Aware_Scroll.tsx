import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, TextInput, UIManager, ViewStyle, useWindowDimensions } from 'react-native';

// 提取 TextInput onFocus回调类型
type InputFocusHandler = NonNullable<React.ComponentProps<typeof TextInput>['onFocus']>;  //  NonNullable 排除undefined/null

// 定义 传给 子组件 渲染 Props类型
interface KeyboardAwareScrollRenderProps {
  onInputFocus: InputFocusHandler;
}

// 定义 组件 接收 Props类型
interface KeyboardAwareScrollProps {
  children: (props: KeyboardAwareScrollRenderProps) => React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  extraKeyboardGap?: number;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function KeyboardAwareScroll({ children, contentContainerStyle,
  keyboardVerticalOffset = 0,   // 键盘垂直偏移
  extraKeyboardGap = 20,        // 额外间距
  keyboardShouldPersistTaps = 'handled',
}: KeyboardAwareScrollProps) {
  const { height: screenHeight } = useWindowDimensions();

  // 创建 引用Ref / 不会触发重渲染 / 核心！
  const scrollRef = useRef<ScrollView>(null);           // 滚动容器 引用
  const scrollYRef = useRef(0);                         // Y轴偏移量
  const focusedTargetRef = useRef<number | null>(null); 
  const keyboardHeightRef = useRef(0);                  // 键盘高度

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 容器基础内边距
  const flattenedStyle = useMemo(() => StyleSheet.flatten(contentContainerStyle) ?? {}, [contentContainerStyle]);
  const basePaddingBottom = typeof flattenedStyle.paddingBottom === 'number' ? flattenedStyle.paddingBottom : 0;

  // 聚焦输入框
  const ensureFocusedInputVisible = useCallback(
    (target: number | null = focusedTargetRef.current) => {
      if (!target) return;

      // 参数说 / _x(组件内X)、_y(组件内Y)、_width(宽)、height(高)、_pageX(页面X)、pageY(页面Y，距离屏幕顶部)
      UIManager.measure(target, (_x, _y, _width, height, _pageX, pageY) => {
        if (!height) return;

        const visibleBottom = screenHeight - keyboardHeightRef.current - extraKeyboardGap;
        const overlap = pageY + height - visibleBottom;
        if (overlap <= 0) return;

        scrollRef.current?.scrollTo({
          y: Math.max(0, scrollYRef.current + overlap + 12),
          animated: true,
        });
      });
    },
    [extraKeyboardGap, screenHeight]  // 依赖  额外间距/屏幕高度
  );

  const onInputFocus = useCallback<InputFocusHandler>(
    (event) => {
      // 获取 输入框 / RN 原生ID 
      const target = typeof event.nativeEvent.target === 'number' ? event.nativeEvent.target : null;
      focusedTargetRef.current = target;
      //多帧 触发滚动 / 测试
      requestAnimationFrame(() => ensureFocusedInputVisible(focusedTargetRef.current));
      setTimeout(() => ensureFocusedInputVisible(focusedTargetRef.current), 120);
    },
    [ensureFocusedInputVisible]
  );

  // 监听 键盘弹出/收起 事件
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const nextHeight = event.endCoordinates?.height ?? 0;
      keyboardHeightRef.current = nextHeight;
      setKeyboardHeight(nextHeight);
      requestAnimationFrame(() => ensureFocusedInputVisible());
      setTimeout(() => ensureFocusedInputVisible(), 120);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [ensureFocusedInputVisible]);

  return (
    // RN内置键盘适配组件 / 底层处理布局偏移 
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    > 

      {/* 滚动容器：核心交互区域 */}
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        onScroll={(event) => {
          // 滚动位置
          scrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={[
          contentContainerStyle,
          { paddingBottom: basePaddingBottom + keyboardHeight + extraKeyboardGap },
        ]}
      >
        {children({ onInputFocus })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
