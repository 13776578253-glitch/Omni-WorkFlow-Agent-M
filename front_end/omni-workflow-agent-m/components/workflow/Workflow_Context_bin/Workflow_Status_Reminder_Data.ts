import type { ThoughtChain } from '@/constants/workflow_type';

// 测试
export const THOUGHT_CHAINS: Record<string, ThoughtChain> = {
  summary: {
    id: 'chain-summary',
    category: 'summary',
    steps: [
      { id: 's1', text: '理解文本内容', status: 'completed', icon: 'document-text-outline' },
      { id: 's2', text: '提取关键信息', status: 'completed', icon: 'key-outline' },
      { id: 's3', text: '组织摘要结构', status: 'completed', icon: 'list-outline' },
      { id: 's4', text: '生成精简总结', status: 'completed', icon: 'checkmark-circle-outline' },
    ],
  },
  translation: {
    id: 'chain-translation',
    category: 'translation',
    steps: [
      { id: 't1', text: '识别源语言', status: 'completed', icon: 'language-outline' },
      { id: 't2', text: '分析语义结构', status: 'completed', icon: 'git-branch-outline' },
      { id: 't3', text: '匹配目标语言表达', status: 'completed', icon: 'swap-horizontal-outline' },
      { id: 't4', text: '优化译文流畅度', status: 'completed', icon: 'create-outline' },
      { id: 't5', text: '完成翻译', status: 'completed', icon: 'checkmark-done-outline' },
    ],
  },
  code: {
    id: 'chain-code',
    category: 'code',
    steps: [
      { id: 'c1', text: '理解需求', status: 'completed', icon: 'bulb-outline' },
      { id: 'c2', text: '设计算法', status: 'completed', icon: 'git-network-outline' },
      { id: 'c3', text: '编写代码', status: 'completed', icon: 'code-slash-outline' },
      { id: 'c4', text: '语法检查', status: 'completed', icon: 'shield-checkmark-outline' },
      { id: 'c5', text: '优化性能', status: 'completed', icon: 'speedometer-outline' },
      { id: 'c6', text: '添加注释', status: 'completed', icon: 'chatbox-outline' },
    ],
  },
  analysis: {
    id: 'chain-analysis',
    category: 'analysis',
    steps: [
      { id: 'a1', text: '收集信息', status: 'completed', icon: 'search-outline' },
      { id: 'a2', text: '数据分析', status: 'completed', icon: 'analytics-outline' },
      { id: 'a3', text: '推理验证', status: 'completed', icon: 'flask-outline' },
      { id: 'a4', text: '得出结论', status: 'completed', icon: 'checkmark-circle-outline' },
    ],
  },
  general: {
    id: 'chain-general',
    category: 'general',
    steps: [
      { id: 'g1', text: '理解问题', status: 'completed', icon: 'eye-outline' },
      { id: 'g2', text: '分析需求', status: 'completed', icon: 'construct-outline' },
      { id: 'g3', text: '生成回复', status: 'completed', icon: 'create-outline' },
    ],
  },
};

export function selectThoughtChain(userInput: string): ThoughtChain {
  const input = userInput.toLowerCase();

  if (input.includes('总结') || input.includes('摘要') || input.includes('概括')) {
    return THOUGHT_CHAINS.summary;
  }

  if (input.includes('翻译') || input.includes('translate') || input.includes('英文') || input.includes('中文')) {
    return THOUGHT_CHAINS.translation;
  }

  if (input.includes('代码') || input.includes('code') || input.includes('编程') || input.includes('函数') || input.includes('bug')) {
    return THOUGHT_CHAINS.code;
  }

  if (input.includes('分析') || input.includes('研究') || input.includes('为什么') || input.includes('原因')) {
    return THOUGHT_CHAINS.analysis;
  }

  return THOUGHT_CHAINS.general;
}
