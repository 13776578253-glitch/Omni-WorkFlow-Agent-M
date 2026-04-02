import type { WorkflowBlock } from '@/constants/workflow_type';

// 测试数据
export const LONG_AUDIO_MOCK_MARKDOWN = `## 长音频整理结果

### 核心结论
- 已完成本段长音频的内容梳理与重点提炼。
- 当前信息已按“结论、重点、行动项”完成结构化整理。

### 重点摘要
- 已识别出本次音频中的主要主题与关键决策点。
- 已提炼需要继续推进的事项与后续跟进方向。
- 若需要，可继续扩展为会议纪要、待办清单或正式汇报稿。

### 建议动作
1. 先确认重点事项的优先级与负责人。
2. 将关键节点整理成时间表，便于后续执行。
3. 如需继续生成文稿，可在此基础上补充更正式的输出格式。`;

export function buildLongAudioMockAIBlock(sourceBlockId: string): WorkflowBlock {
  return {
    id: `ai-long-audio-mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'ai',
    content: LONG_AUDIO_MOCK_MARKDOWN,
    createdAt: Date.now(),
    sourceBlockId,
    status: 'done',
    thoughtChain: {
      id: `thought-long-audio-${Date.now()}`,
      category: 'long-audio',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          text: '正在解析长音频主题与结构',
          status: 'completed',
          type: 'summary',
        },
        {
          id: `step-${Date.now()}-2`,
          text: '正在提炼重点与行动项',
          status: 'completed',
          type: 'summary',
        },
        {
          id: `step-${Date.now()}-3`,
          text: '正在整理为可继续处理的结果',
          status: 'completed',
          type: 'summary',
        },
      ],
    },
    thoughtChainAnimationPlayed: false,
    messageAnimationPlayed: false,
    editedByUser: false,
  } as WorkflowBlock;
}
