import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { ThoughtChain } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowStatusReminderProps {
  thoughtChain: ThoughtChain;
}

export function WorkflowStatusReminder({ thoughtChain }: WorkflowStatusReminderProps) {
  const textColor = useThemeColor({}, 'text');
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    thoughtChain.steps.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleSteps(i + 1), i * 300));
    });
    return () => timers.forEach(clearTimeout);
  }, [thoughtChain]);

  return (
    <View style={styles.container}>
      {thoughtChain.steps.map((step, i) => {
        if (i >= visibleSteps) return null;
        return <StepItem key={step.id} step={step} textColor={textColor} />;
      })}
    </View>
  );
}

function StepItem({ step, textColor }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.stepRow, { opacity: fadeAnim }]}>
      <Ionicons name={step.icon as any} size={16} color={textColor + '60'} />
      <Text style={[styles.stepText, { color: textColor + '90' }]}>{step.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, gap: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepText: { fontSize: 13, lineHeight: 18 },
});
