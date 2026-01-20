// 预留后端通信模型
export interface WorkflowHistory {
  id: string;
  title: string;
  timestamp: string;
  type: 'chat' | 'task' | 'agent';
}