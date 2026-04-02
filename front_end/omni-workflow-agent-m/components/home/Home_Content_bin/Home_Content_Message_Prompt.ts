export const HOME_CAPABILITY_PROMPTS = {
  interpret: '请作为同声传译助手，提供低延迟、多语种的实时互译方案，并根据实际交流场景整理为可执行的工作流步骤。',
  slides: '请根据我的需求生成一套 AI 幻灯片制作方案，先整理主题结构、页面大纲、每页重点，再继续补充视觉与内容建议。',
  doc_processor: '请帮助我处理长篇文档，完成深度解析、重点提取、结构重排，并输出适合继续编辑和执行的工作流结果。',
  charting: '请根据我的数据分析需求，整理图表绘制思路、推荐合适的可视化形式，并输出清晰的展示结构与解读要点。',
  customize: '请帮助我定制一套完整工作流，明确目标、输入、处理步骤、输出结果与自动化执行建议。',
} as const;

export type HomeCapabilityPromptKey = keyof typeof HOME_CAPABILITY_PROMPTS;
