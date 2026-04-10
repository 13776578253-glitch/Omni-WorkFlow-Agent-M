// 导入标准数据模型
import type { WorkflowAttachment, WorkflowBlock } from '@/constants/workflow_type';

export const HOME_SCHEDULE_PROMPT = '帮我整理这份排期规划和任务表，结合我上传的文件。';
export const HOME_SCHEDULE_REPLY ='好的，请上传您需要总结的文档和图片，我将为您制定排期规划和任务表。';
export const ORGANIZE_DOC_PROMPT = '好的，帮我整理';
export const ORGANIZE_DOC_REPLY = '好的，整理文档如下';
export const ORGANIZE_DOC_ATTACHMENT_FILE_NAME = '移动端智能工作流助手项目排期规划任务表.md';
export const PPT_REPORT_PROMPT = '基于转写结果生成一份PPT汇报';
export const PPT_REPORT_REPLY = '好的，我已收到您的音频文件。我将先为您转写音频内容并生成概要，随后为您制作一份 PPT 演示文稿。现在开始处理。';
export const PPT_REPORT_ATTACHMENT_FILE_NAME = '音乐推荐系统：算法与特征工程深度解析.pptx';
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
export const PPT_REPORT_RESULT_MARKDOWN = [
  PPT_REPORT_REPLY,
  '',
  '我已经为您完成了音频转写、内容提炼以及 PPT 汇报材料的整理，相关结果如下。',
  '',
  '## 处理结果',
  '',
  '- 已完成音频转写与时间轴整理。',
  '- 已提炼适合汇报展示的核心主题、方法说明与结论要点。',
  '- 已生成可继续浏览、分享的 PPT 演示文稿附件。',
  '',
  '## 转写内容',
  '',
  '[00:00.0 - 00:10.0] 你提到这些特征,你提到个人特征和公共特征,这些特征你是怎么去分类和处理的?',
  '[00:10.0 - 00:18.0] 不是四种数据吗?正数据,强负数据,弱负数据,还有一个模糊数据。',
  '[00:18.0 - 00:38.0] 正数据对应的就是用户特别喜欢的判定条件,比如说那些完整播放率来判定的,',
  '[00:38.0 - 00:45.0] 就是能确定用户确实喜欢这首歌的那种数据。',
  '[00:45.0 - 00:53.0] 强负就是用户一定不喜欢这首歌,比如说他多次跳过了,或者是一般不听了。',
  '[00:53.0 - 01:01.0] 模糊数据就是那种无法判别是否喜欢的那些数据。',
  '[01:01.0 - 01:18.0] 弱负就是没有被听过的那些歌也要进行训练,因为得让决策数学习到这个值。',
  '[01:18.0 - 01:28.0] 就得让决策数有这个分值,不然遇到这种数据的话,他会预测不了。',
  '[01:28.0 - 01:32.0] 就分这四种数据进行预测。',
  '[01:32.0 - 01:50.0] 这四种数据提取是分用户籍信息,还有一个是全局歌曲状态信息,还有播放历史的聚合信息。',
  '[01:50.0 - 01:57.0] 对,三类信息源,刚刚说的是四种分类,然后这是三类信息源。',
  '[01:57.0 - 02:02.0] 就从这三类信息源提取出来,然后分成四种类型,然后再喂给决策数。',
  '[02:02.0 - 02:11.0] 然后就训练完决策数之后,可以在后端训练。',
  '[02:11.0 - 02:18.0] 这是ABR数的,我刚刚看ABR数。',
  '[02:18.0 - 02:30.0] 决策数的训练,反正它是可以在后端手动训练,但是没有做管理员的那种可视化训练。',
  '[02:30.0 - 02:39.0] 对,现在还没做那玩意儿,现在先是在后端训练的,反正强调服务器运行的后端训练也可以的。',
  '[02:39.0 - 02:59.0] 然后就是热门推荐,热门推荐的是这些歌单,这些歌单就是按播放量和那个环播率筛选出来的。',
  '[03:00.0 - 03:16.0] 就是点进去会有这些歌曲信息,这边可以点添加或不添加,然后可以,可能可以的。',
  '[03:16.0 - 03:23.0] 它播放五秒之后会自动记录历史数据,然后歌单信息。',
  '',
  '## 概要信息',
  '',
  '转写文稿围绕音乐推荐系统中的特征工程与模型训练流程展开，适合整理为一份方法说明型汇报。核心要点如下：',
  '',
  '- **数据分层方式**：讨论中将训练样本拆分为正数据、强负数据、弱负数据和模糊数据，其中弱负数据被特别强调，用于避免模型在未播放样本上的预测能力不足。',
  '- **特征来源结构**：特征主要来自三类信息源，包括用户侧信息、全局歌曲状态信息，以及播放历史的聚合行为数据。',
  '- **模型训练逻辑**：当前方案以决策树为核心，在后端完成训练与更新，暂未建设管理员可视化训练界面。',
  '- **推荐结果生成**：热门推荐部分主要依据播放量和环播率筛选歌单，再结合歌曲信息与历史行为形成最终推荐展示。',
  '',
  'PPT 讲稿已挂载到附件中，您可以根据需要进行调整和补充：',
].join('\n');

function normalizeAttachmentName(fileName?: string | null) {
  if (!fileName) return '';
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return withoutExtension.replace(/[\s_\-()（）【】\[\].,，。]/g, '').toLowerCase();
}

function normalizeScenarioText(text?: string | null) {
  if (!text) return '';
  return text.replace(/[\s_\-()（）【】\[\].,，。:：!！?？]/g, '').toLowerCase();
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

export function isPptReportMockScenario(userContent: string) {
  return normalizeScenarioText(userContent).includes(normalizeScenarioText(PPT_REPORT_PROMPT));
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

  if (isPptReportMockScenario(trimmedContent)) {
    return {
      id: 'mock-ppt-report',
      role: 'ai',
      content: PPT_REPORT_RESULT_MARKDOWN,
      createdAt: Date.now(),
      sourceBlockId: 'mock-ppt-report-source',
    };
  }

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
