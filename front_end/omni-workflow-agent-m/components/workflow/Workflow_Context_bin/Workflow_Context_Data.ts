// 导入标准数据模型
import type { WorkflowBlock } from '@/constants/workflow_type';

// 目前存在问题 
// 仅使用 content 字段，后续如果需要区分不同格式（如纯文本、富文本、Markdown等），可以考虑增加一个字段来标识内容类型，例如 contentType: 'markdown' | 'text' | 'html' 等，以便在渲染时进行不同的处理。
// 没有使用到 WorkflowUserBlock 和 WorkflowAIBlock 的特定字段

// 供循环使用的 Mock 数据源
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

// 初始默认消息（如果本地存储为空）
export const DEFAULT_INITIAL_MESSAGES: WorkflowBlock[] = [
  MARKDOWN_MOCK_DATA[0]
];
