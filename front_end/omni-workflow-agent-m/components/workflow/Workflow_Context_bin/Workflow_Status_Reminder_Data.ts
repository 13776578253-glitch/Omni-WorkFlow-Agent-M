import type { ThoughtChain } from '@/constants/workflow_type';

// 测试
export const THOUGHT_CHAINS: Record<string, ThoughtChain> = {
  summary: {
    id: 'chain-summary',
    category: 'summary',
    steps: [
      { id: 's1', type: 'summary', text: '[READ_FILE] 我已读取文件。检测到文件格式为 PDF，包含 12 页内容，约 5,400 个字符。', status: 'completed', icon: 'document-text-outline' },
      { id: 's2', type: 'command', text: '正在初始化文本解析引擎...', status: 'completed', icon: 'terminal-outline' },
      { id: 's3', type: 'summary', text: '[ANALYZE_STRUCTURE] 正在识别文档层级。已定位 4 个核心章节：项目背景、技术选型、开发进度、后续计划。', status: 'completed', icon: 'analytics-outline' },
      { id: 's4', type: 'command', text: '正在提取各章节关键句...', status: 'completed', icon: 'terminal-outline' },
      { id: 's5', type: 'text', text: '已完成文档结构分析，识别出 4 个主要章节和 12 个子节点。', status: 'completed' },
      { id: 's6', type: 'summary', text: '[SEMANTIC_SEARCH] 正在检索关键词：React Native, Expo, 文件系统, 性能瓶颈。已捕获 8 处核心技术描述。', status: 'completed', icon: 'search-outline' },
      { id: 's7', type: 'command', text: '正在比对前后文逻辑一致性...', status: 'completed', icon: 'terminal-outline' },
      { id: 's8', type: 'text', text: '语义检索完成，已提取 8 个关键技术点和 3 个潜在风险项。', status: 'completed' },
      { id: 's9', type: 'summary', text: '[SUMMARIZING] 正在压缩冗余信息。正在将 5,000 字原文提炼为 300 字核心摘要，并生成 5 条关键行动点。', status: 'completed', icon: 'list-outline' },
      { id: 's10', type: 'command', text: '正在优化 Markdown 排版格式...', status: 'completed', icon: 'terminal-outline' },
      { id: 's11', type: 'summary', text: '[FINAL_CHECK] 正在检查总结内容的准确性，确保未遗漏文档中的关键时间节点和技术参数。', status: 'completed', icon: 'checkmark-circle-outline' },
    ],
  },
  translation: {
    id: 'chain-translation',
    category: 'translation',
    steps: [
      { id: 't1', type: 'summary', text: '[DETECT_LANGUAGE] 识别源语言为英文，目标语言为中文。', status: 'completed', icon: 'language-outline' },
      { id: 't2', type: 'command', text: '正在分析语义结构...', status: 'completed', icon: 'terminal-outline' },
      { id: 't3', type: 'text', text: '已识别 15 个句子，包含 3 个专业术语和 2 个习语表达。', status: 'completed' },
      { id: 't4', type: 'summary', text: '[TRANSLATE] 正在匹配目标语言表达，保持原文语气和专业性。', status: 'completed', icon: 'swap-horizontal-outline' },
      { id: 't5', type: 'command', text: '正在优化译文流畅度...', status: 'completed', icon: 'terminal-outline' },
      { id: 't6', type: 'summary', text: '[VERIFY] 完成翻译，已校验术语准确性和语法正确性。', status: 'completed', icon: 'checkmark-done-outline' },
    ],
  },
  code: {
    id: 'chain-code',
    category: 'code',
    steps: [
      { id: 'c1', type: 'summary', text: '[UNDERSTAND] 理解需求：实现用户登录功能，包含表单验证和错误处理。', status: 'completed', icon: 'bulb-outline' },
      { id: 'c2', type: 'command', text: '正在设计算法和数据结构...', status: 'completed', icon: 'terminal-outline' },
      { id: 'c3', type: 'text', text: '已确定使用 React Hook Form 进行表单管理，Zod 进行验证。', status: 'completed' },
      { id: 'c4', type: 'summary', text: '[CODE] 正在编写代码，包含登录表单组件、验证逻辑和 API 调用。', status: 'completed', icon: 'code-slash-outline' },
      { id: 'c5', type: 'command', text: '正在进行语法检查和类型校验...', status: 'completed', icon: 'terminal-outline' },
      { id: 'c6', type: 'text', text: 'TypeScript 编译通过，无类型错误。', status: 'completed' },
      { id: 'c7', type: 'summary', text: '[OPTIMIZE] 正在优化性能，添加防抖和缓存机制。', status: 'completed', icon: 'speedometer-outline' },
      { id: 'c8', type: 'command', text: '正在添加代码注释和文档...', status: 'completed', icon: 'terminal-outline' },
    ],
  },
  analysis: {
    id: 'chain-analysis',
    category: 'analysis',
    steps: [
      { id: 'a1', type: 'summary', text: '[COLLECT] 正在收集相关信息和数据源。', status: 'completed', icon: 'search-outline' },
      { id: 'a2', type: 'command', text: '正在分析数据模式和趋势...', status: 'completed', icon: 'terminal-outline' },
      { id: 'a3', type: 'text', text: '已识别 3 个关键指标和 2 个异常数据点。', status: 'completed' },
      { id: 'a4', type: 'summary', text: '[ANALYZE] 正在进行深度分析，建立因果关系模型。', status: 'completed', icon: 'analytics-outline' },
      { id: 'a5', type: 'command', text: '正在推理验证假设...', status: 'completed', icon: 'terminal-outline' },
      { id: 'a6', type: 'summary', text: '[CONCLUDE] 得出结论：性能瓶颈主要由数据库查询效率低下导致。', status: 'completed', icon: 'checkmark-circle-outline' },
    ],
  },
  general: {
    id: 'chain-general',
    category: 'general',
    steps: [
      { id: 'g1', type: 'summary', text: '[UNDERSTAND] 正在理解问题的核心需求。', status: 'completed', icon: 'eye-outline' },
      { id: 'g2', type: 'command', text: '正在分析上下文和相关信息...', status: 'completed', icon: 'terminal-outline' },
      { id: 'g3', type: 'text', text: '已明确问题范围和预期输出格式。', status: 'completed' },
      { id: 'g4', type: 'summary', text: '[GENERATE] 正在生成回复内容。', status: 'completed', icon: 'create-outline' },
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
