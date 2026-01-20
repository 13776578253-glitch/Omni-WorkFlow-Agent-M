import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { WorkflowList } from '@/components/workflow/workflow-list/workflow-list';

export default function WorkflowTabPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 初始跳转逻辑 点击加号跳转
  const handleNewChat = () => {
    console.log("Navigating to assistant...");
    router.push({ pathname:'/workflow_assistant'}); 
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WorkflowList onNewChat={handleNewChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});