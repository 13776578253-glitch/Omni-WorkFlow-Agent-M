import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { ThoughtChain, ThoughtStep } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowStatusReminderProps {
  thoughtChain: ThoughtChain;
}

// 工作流状态提醒组件，展示思维链的执行步骤和状态
export function WorkflowStatusReminder({ thoughtChain }: WorkflowStatusReminderProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelay = 0;

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

    return () => timers.forEach(clearTimeout);
  }, [thoughtChain]);

  return (
    <View style={styles.container}>
      {thoughtChain.steps.map((step, i) => {
        if (i >= visibleSteps) return null;
        return <StepItem key={step.id} step={step} />;
      })}
      {showLoading && <LoadingIndicator />}
    </View>
  );
}

// 单个步骤组件，根据步骤类型展示不同的样式和动画
function StepItem({ step }: { step: ThoughtStep }) {
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({ light: '#F5F5F5', dark: '#2A2A2A' }, 'background');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (step.type === 'text') {
    return <TypewriterText text={step.text} textColor={textColor} fadeAnim={fadeAnim} />;
  }

  const isPill = step.type === 'command' || step.type === 'summary';

  return (
    <Animated.View style={[styles.stepRow, isPill && styles.pillContainer, isPill && { backgroundColor: bgColor }, { opacity: fadeAnim }]}>
      {step.icon && <Ionicons name={step.icon as any} size={16} color={textColor + '60'} />}
      <Text style={[styles.stepText, { color: textColor + (isPill ? '80' : '90') }]}>{step.text}</Text>
    </Animated.View>
  );
}

// 打字机效果文本组件，逐字显示文本内容
function TypewriterText({ text, textColor, fadeAnim }: { text: string; textColor: string; fadeAnim: Animated.Value }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [text]);

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
    gap: 6
  },
  stepRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  pillContainer: {
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 16, 
    alignSelf: 'flex-start' 
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
