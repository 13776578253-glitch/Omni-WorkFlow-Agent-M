import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { ThoughtChain, ThoughtStep } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowStatusReminderProps {
  thoughtChain: ThoughtChain;
  hasPlayed?: boolean;
  onAnimationStart?: () => void;
  onComplete?: () => void;
}

// 工作流状态提醒组件，展示思维链的执行步骤和状态
export function WorkflowStatusReminder({ thoughtChain, hasPlayed = false, onAnimationStart, onComplete }: WorkflowStatusReminderProps) {
  const shouldAnimate = !hasPlayed;
  const [visibleSteps, setVisibleSteps] = useState(shouldAnimate ? 0 : thoughtChain.steps.length);
  const [showLoading, setShowLoading] = useState(false);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const onAnimationStartRef = useRef(onAnimationStart);
  const onCompleteRef = useRef(onComplete);

  const borderLeftColor = useThemeColor({ light: '#0a7ea4', dark: '#60A5FA' }, 'tint');

  useEffect(() => {
    onAnimationStartRef.current = onAnimationStart;
    onCompleteRef.current = onComplete;
  }, [onAnimationStart, onComplete]);

  useEffect(() => {
    if (!shouldAnimate) {
      setVisibleSteps(thoughtChain.steps.length);
      setShowLoading(false);
      startedRef.current = true;
      completedRef.current = true;
      return;
    }

    if (startedRef.current) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelay = 0;
    completedRef.current = false;
    setVisibleSteps(0);
    setShowLoading(false);

    startedRef.current = true;
    onAnimationStartRef.current?.();

    thoughtChain.steps.forEach((step, i) => {
      const prevStep = i > 0 ? thoughtChain.steps[i - 1] : null;

      if (prevStep?.type === 'command') {
        const randomDelay = 3000 + Math.random() * 3000;

        timers.push(setTimeout(() => setShowLoading(true), cumulativeDelay));
        cumulativeDelay += randomDelay;
        timers.push(setTimeout(() => {
          setShowLoading(false);
          setVisibleSteps(i + 1);
        }, cumulativeDelay));
      } else {
        cumulativeDelay += 300;
        timers.push(setTimeout(() => setVisibleSteps(i + 1), cumulativeDelay));
      }
    });

    timers.push(setTimeout(() => {
      setShowLoading(false);
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    }, cumulativeDelay + 50));

    return () => timers.forEach(clearTimeout);
  }, [shouldAnimate, thoughtChain]);

  return (
    <View style={[styles.container, { borderLeftColor }]}>
      {thoughtChain.steps.map((step, i) => {
        if (i >= visibleSteps) return null;
        return <StepItem key={step.id} step={step} shouldAnimate={shouldAnimate} />;
      })}
      {showLoading && <LoadingIndicator />}
    </View>
  );
}

// 单个步骤组件，根据步骤类型展示不同的样式和动画
function StepItem({ step, shouldAnimate }: { step: ThoughtStep; shouldAnimate: boolean }) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({ light: '#0a7ea4', dark: '#60A5FA' }, 'tint');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (step.type === 'text') {
    return <TypewriterText text={step.text} textColor={textColor} fadeAnim={fadeAnim} shouldAnimate={shouldAnimate} />;
  }

  return (
    <Animated.View style={[styles.stepRow, { opacity: fadeAnim }]}>
      {step.icon && <Ionicons name={step.icon as any} size={18} color={step.type === 'command' ? iconColor : textColor + 'CC'} />}
      <Text style={[styles.stepText, { color: textColor + 'CC' }]}>{step.text}</Text>
    </Animated.View>
  );
}

// 打字机效果文本组件，逐字显示文本内容
function TypewriterText({
  text,
  textColor,
  fadeAnim,
  shouldAnimate,
}: {
  text: string;
  textColor: string;
  fadeAnim: Animated.Value;
  shouldAnimate: boolean;
}) {
  const [displayText, setDisplayText] = useState(shouldAnimate ? '' : text);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayText(text);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 58);
    return () => clearInterval(timer);
  }, [shouldAnimate, text]);

  return (
    <Animated.View style={[styles.textRow, { opacity: fadeAnim }]}>
      <Text style={[styles.textContent, { color: textColor + 'CC' }]}>{displayText}</Text>
    </Animated.View>
  );
}

// 加载指示器组件，显示正在生成的状态
function LoadingIndicator() {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator size="small" color={textColor + '60'} />
      <Text style={[styles.loadingText, { color: textColor + '60' }]}>正在生成...</Text>
    </View>
  );     
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    gap: 8,
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stepText: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1
  },
  textRow: { 
    paddingVertical: 4 
  },
  textContent: { 
    fontSize: 13, 
    lineHeight: 20 
  },
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingVertical: 6 
  },
  loadingText: { 
    fontSize: 13 
  },
});
