import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible'; 

export default function WorkflowScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, paddingTop: 60 }}>
      <ThemedText type="title">我的工作流</ThemedText>
      
      {/* 这里就可以直接用你那个 Collapsible UI 组件了 */}
      <Collapsible title="查看待办事项">
        <ThemedText>这里是折叠面板内部的内容...</ThemedText>
      </Collapsible>
    </ThemedView>
  );
}