// 导入标准数据模型
import type { WorkflowAttachment, WorkflowBlock } from '@/constants/workflow_type';

export const HOME_SCHEDULE_PROMPT = '帮我整理这份排期规划和任务表，结合我上传的文件。';
export const HOME_SCHEDULE_REPLY ='好的，请上传您需要总结的文档和图片，我将为您制定排期规划和任务表。';
export const ORGANIZE_DOC_PROMPT = '好的，帮我整理';
export const ORGANIZE_DOC_REPLY = '好的，整理文档如下';
export const ORGANIZE_DOC_ATTACHMENT_FILE_NAME = '移动端智能工作流助手项目排期规划任务表.md';
export const SCHEDULE_PLAN_FILE_KEYWORD = '排期规划';
export const SCHEDULE_PLAN_ACKNOWLEDGEMENT = '收到，我已经看到了您上传的“排期规划.txt”文件。我将立即阅读文件内容，并为您制定详细的任务排期表。请稍候。';
export const SCHEDULE_PLAN_RESULT_MARKDOWN = [
  SCHEDULE_PLAN_ACKNOWLEDGEMENT,
  '',
  '我已经根据您提供的项目背景材料，为您制定了一份详细的移动端智能工作流助手项目排期规划与任务表。',
  '',
  '# 移动端智能工作流助手项目排期规划与任务表',
  '',
  '## 第一部分：项目当前阶段总结',
  '',
  '当前“移动端智能工作流助手”项目已进入演示与验收前的关键收口阶段。项目基于 React Native + Expo 构建，采用“手机端轻交互 + 服务端集中处理”的前后端分离架构，已初步实现包括首页统一任务入口、多模态工作流处理、历史会话管理以及用户个性化设置等核心功能。目前，主要工作聚焦于打通端到端演示链路、完善用户体验细节、处理数据模拟与认证逻辑，以及全面排查风险，以确保项目能够顺利通过演示和验收。',
  '',
  '## 第二部分：排期规划',
  '',
  '本排期规划遵循“先保证演示链路通畅，再完善细节”的原则，将收口工作拆分为三个主要阶段，每个阶段均有明确的目标、主要任务和预期产出。',
  '',
  '### 阶段一：核心演示链路打通与数据准备 (Day 1)',
  '',
  '*   **目标**：确保项目核心演示路径的端到端流程顺畅，并准备好演示所需的基础数据和认证环境。',
  '*   **主要任务**：',
  '    *   优化首页到工作流的入口链路，确保用户能快速启动工作流。',
  '    *   整理并替换核心演示路径所需的 Mock 数据，覆盖文本、短录音、文件等常见输入场景。',
  '    *   补全认证和演示账号逻辑，确保演示人员能够顺利登录并使用系统。',
  '*   **预期产出**：',
  '    *   可流畅演示的首页至工作流核心路径。',
  '    *   覆盖主要演示场景的 Mock 数据集。',
  '    *   稳定可用的演示账号登录流程。',
  '',
  '### 阶段二：多模态功能与交互细节完善 (Day 2)',
  '',
  '*   **目标**：完善多模态输入功能在演示中的稳定性，并优化历史会话管理及首页信息展示的细节。',
  '*   **主要任务**：',
  '    *   对长音频、短录音、文件上传等演示路径进行兜底处理，确保在不同情况下都能有合理的用户反馈和展示。',
  '    *   调整历史页的分享逻辑结构，使其更符合用户预期和产品设计。',
  '    *   填充首页下滑后的日历/门户区域数据，使其在演示时具备内容。',
  '*   **预期产出**：',
  '    *   多模态输入演示流程稳定，具备异常处理机制。',
  '    *   历史页分享功能逻辑清晰，可进行演示。',
  '    *   首页日历/门户区域展示有实际内容。',
  '',
  '### 阶段三：全面收口与验收准备 (Day 3)',
  '',
  '*   **目标**：完成所有 UI 文案和演示内容的最终确认，进行全面的风险排查，并准备验收演示所需的所有材料。',
  '*   **主要任务**：',
  '    *   统一收口所有 UI 文案和演示内容，确保语言风格一致且无错漏。',
  '    *   进行全面的风险排查，包括性能、兼容性、用户体验等方面，并进行必要的微调。',
  '    *   编写详细的验收演示脚本，并确认演示环境的各项配置。',
  '*   **预期产出**：',
  '    *   UI 文案和演示内容最终定稿。',
  '    *   一份完整的风险排查报告及优化建议。',
  '    *   可执行的验收演示脚本和准备就绪的演示环境。',
  '',
  '需要我将生成内容打包成文档输出吗？',
].join('\n');

function normalizeAttachmentName(fileName?: string | null) {
  if (!fileName) return '';
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return withoutExtension.replace(/[\s_\-()（）【】\[\].,，。]/g, '').toLowerCase();
}

export function hasSchedulePlanFileAttachment(attachments: WorkflowAttachment[] = []) {
  return attachments.some((attachment) => {
    const normalizedName = normalizeAttachmentName(attachment.fileName);
    return normalizedName.includes('排期规划') || (normalizedName.includes('排期') && normalizedName.includes('规划'));
  });
}

export function isOrganizeDocumentMockScenario(userContent: string) {
  return userContent.trim().includes(ORGANIZE_DOC_PROMPT);
}

// 目前存在问题 
// 仅使用 content 字段，后续如果需要区分不同格式（如纯文本、富文本、Markdown等），可以考虑增加一个字段来标识内容类型，例如 contentType: 'markdown' | 'text' | 'html' 等，以便在渲染时进行不同的处理。
// 没有使用到 WorkflowUserBlock 和 WorkflowAIBlock 的特定字段

// 供循环使用的 Mock 数据源 
// 可能错误的逻辑 / 待修改 
export const MARKDOWN_MOCK_DATA: WorkflowBlock[] = [
  {
    id: 'mock-1',
    role: 'ai',
    content: '# Workflow Assistant\n\nHello! I am ready to help you organize your tasks. Here is what I can do:\n\n- Summarize notes\n- Draft emails\n- Create schedules',
    createdAt: Date.now(),
    sourceBlockId: 'mock-0'
  },
  {
    id: 'mock-2',
    role: 'ai',
    content: '## Meeting Notes\n\nPlease summarize the following:\n\n> The project timeline is tight. We need to prioritize the MVP features.',
    createdAt: Date.now(),
    sourceBlockId: 'mock-1'
  },
  {
    id: 'mock-3',
    role: 'ai',
    content: '**Summary**:\n\n1. **Timeline**: Tight constraints.\n2. **Action**: Prioritize MVP.',
    createdAt: Date.now(),
    sourceBlockId: 'mock-2'
  },
  {
    id: 'mock-4',
    role: 'ai',
    content: '好的，没问题！让 React 前端显示不同的格式是一个常见的需求，涉及到数据处理、格式转换和渲染。下面我将从几个方面来告诉你如何实现，并以 Markdown 形式详细说明：\n\n**1. 了解你的数据和格式**\n\n*   **数据源:**  你的数据来自哪里？ 是 API 接口、JSON 文件、还是其他地方？ 了解数据的结构非常重要。\n*   **支持的格式:**  你想要支持哪些不同的格式？ 比如：\n    *   文本\n    *   日期\n    *   数字（整数、浮点数、货币等）\n    *   JSON\n    *   HTML\n    *   Markdown\n    *   自定义格式（例如，某种特定的数据结构）\n*   **格式转换规则:**  每种格式之间需要如何转换？  例如，将日期字符串转换为日期对象，将数字字符串转换为数字类型，等等。\n\n**2.  数据处理和格式转换**\n\n*   **使用 JavaScript 进行转换:**  这是最常见的方法。  你可以使用 JavaScript 的内置方法和库来进行数据类型转换、字符串处理、日期处理等等。\n    *   `parseInt()`, `parseFloat()`, `Number()`:  将字符串转换为数字。\n    *   `String()`: 将数字转换为字符串。\n    *   `Date()`:  将日期字符串转换为日期对象。\n    *   `JSON.parse()`:  将 JSON 字符串转换为 JSON 对象。\n    *   正则表达式:  用于复杂的字符串匹配和替换。\n*   **使用日期库:**  如果你的数据包含日期，强烈建议使用日期库，例如：\n    *   **Moment.js (已过时，不推荐):**  曾经非常流行，但现在不推荐使用，因为它体积较大且不再积极维护。\n    *   **Luxon:**  Moment.js 的一个替代品，更现代、更易于使用，并且性能更好。\n    *   **date-fns:**  一个轻量级的日期处理库，提供各种日期和时间操作。\n*   **使用转换库:**  如果需要处理更复杂的格式转换，可以考虑使用转换库，例如：\n    *   **Numeral.js:**  用于格式化数字，例如货币、百分比、小数点位数等。\n    *   **js-yaml:**  用于解析和生成 YAML 格式的数据。\n\n**3.  React 组件设计**\n\n*   **创建通用组件:**  为了避免代码重复，可以创建通用的组件，用于显示不同格式的数据。\n*   **使用条件渲染:**  根据数据的格式，使用 `if` 语句或逻辑运算符 ( `&&`, `||` ) 来决定渲染哪个组件或显示哪个内容。\n*   **使用 `switch` 语句:**  如果需要根据数据的格式选择不同的转换函数，可以使用 `switch` 语句。\n*   **使用 `props` 传递数据和格式信息:**  将数据、格式信息（例如，日期格式、数字格式）通过 `props` 传递给组件，然后在组件内部进行处理。\n\n**',
    createdAt: Date.now(),
    sourceBlockId: 'mock-3'
  },
];

export function isSchedulePlanMockScenario(
  userContent: string,
  attachments: WorkflowAttachment[] = []
) {
  const trimmedContent = userContent.trim();
  const hasPlanPrompt = trimmedContent.includes(HOME_SCHEDULE_PROMPT);
  const hasPlanFile = hasSchedulePlanFileAttachment(attachments);

  return hasPlanPrompt || hasPlanFile;
}

export function selectMockMarkdownBlock(
  userContent: string,
  aiSequenceIndex: number,
  attachments: WorkflowAttachment[] = []
): WorkflowBlock {
  const trimmedContent = userContent.trim();

  if (trimmedContent.includes(HOME_SCHEDULE_PROMPT)) {
    return {
      id: 'mock-home-schedule',
      role: 'ai',
      content: HOME_SCHEDULE_REPLY,
      createdAt: Date.now(),
      sourceBlockId: 'mock-home-schedule-source',
    };
  }

  if (isOrganizeDocumentMockScenario(trimmedContent)) {
    return {
      id: 'mock-organize-doc',
      role: 'ai',
      content: ORGANIZE_DOC_REPLY,
      createdAt: Date.now(),
      sourceBlockId: 'mock-organize-doc-source',
    };
  }

  if (isSchedulePlanMockScenario(trimmedContent, attachments)) {
    return {
      id: 'mock-schedule-plan-file',
      role: 'ai',
      content: SCHEDULE_PLAN_RESULT_MARKDOWN,
      createdAt: Date.now(),
      sourceBlockId: 'mock-schedule-plan-file-source',
    };
  }

  return MARKDOWN_MOCK_DATA[aiSequenceIndex % MARKDOWN_MOCK_DATA.length];
}

// 初始默认消息（如果本地存储为空）
export const DEFAULT_INITIAL_MESSAGES: WorkflowBlock[] = [
  MARKDOWN_MOCK_DATA[0]
];
