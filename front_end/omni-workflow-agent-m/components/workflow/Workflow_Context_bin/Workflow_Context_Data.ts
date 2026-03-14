// 工作流消息接口 / 测试 / 待修改
export interface WorkflowMessage {
  id: string;             // 消息ID
  role: 'user' | 'ai';    
  text: string;           // 文本内容
}

// 测试 md 数据
const MARKDOWN_MOCK_DATA: WorkflowMessage[] = [
  { 
    id: '1', 
    role: 'ai', 
    text: '# Workflow Assistant\n\nHello! I am ready to help you organize your tasks. Here is what I can do:\n\n- Summarize notes\n- Draft emails\n- Create schedules' 
  },
  { 
    id: '2', 
    role: 'user', 
    text: '## Meeting Notes\n\nPlease summarize the following:\n\n> The project timeline is tight. We need to prioritize the MVP features.' 
  },
  { 
    id: '3', 
    role: 'ai', 
    text: '**Summary**:\n\n1. **Timeline**: Tight constraints.\n2. **Action**: Prioritize MVP.' 
  },
  { 
    id: '4', 
    role: 'user', 
    text: 'Great. `Code` looks good too.' 
  },
];

// 测试数据 / 循环输出
export const DEFAULT_WORKFLOW_MESSAGES: WorkflowMessage[] = Array.from({ length: 4 }).flatMap((_, round) =>
  MARKDOWN_MOCK_DATA.map((item) => ({
    ...item,
    id: `${round + 1}-${item.id}`,
  }))
);
