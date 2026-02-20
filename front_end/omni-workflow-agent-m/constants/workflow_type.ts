// workflow 类型定义

// 展示模式 ：welcome（首次进入）、recording（录音中）、document（文档编辑）
export type WorkflowMode = 'welcome' | 'recording' | 'document';

// 块类型与内容
// 对话角色
export type BlockRole = 'user' | 'ai';

// 用户内容来源类型（用于判断概要生成规则）
export type UserContentSource = 'transcript' | 'uploaded_file' | 'manual_input';

// 上传文件引用
export interface WorkflowFileRef {
  url?: string;                          // 文件 URL / 后端返回的下载/预览链接
  path?: string;                         // 本地文件路径
  mimeType?: string;                     // 文件类型
  fileName: string;         
}

// user block：文本或文件
export interface WorkflowUserBlock {
  id: string;               
  role: 'user';             
  content: string;                       // 内容  / 输入文本
  fileRef?: WorkflowFileRef;             // 文件引用（可选）
  createdAt: number;                     // 创建时间（时间戳）
  editedByUser?: boolean;                // 是否被用户编辑（可选）

  // 翻译
  originalLanguage?: string;             // 原始语言（如 'en', 'zh'）
  translatedContent?: string;            // 翻译后的中文内容
  isTranslated?: boolean;        
  
  // 内容来源 / 判断概要生成规则 / 测试逻辑
  source?: UserContentSource;
  // - 'transcript': 录音转写 → 必定触发概要生成
  // - 'uploaded_file': 上传文档 → 后端判断是否生成概要
  // - 'manual_input': 手动输入 → 不触发概要生成
  
  // 概要生成 
  hasSummary?: boolean;                  // 是否已生成概要
  summaryContent?: string;               // 概要内容
  shouldGenerateSummary?: boolean;       // 是否应该生成概要
  // 规则
  // - source='transcript' → shouldGenerateSummary=true（必定生成）
  // - source='uploaded_file' → shouldGenerateSummary 由后端判断
  // - source='manual_input' → shouldGenerateSummary=false（不生成）
}

// AI block：生成文本，可被用户编辑
export interface WorkflowAIBlock {
  id: string;
  role: 'ai';
  content: string;                       // 内容  / 输出文本
  createdAt: number;                     // 创建时间（时间戳）
  sourceBlockId: string;                 // 源块 ID（可选） / 测试
  editedByUser?: boolean;                // 是否被用户编辑（可选） / 测试
  status?: 'pending' | 'done' | 'error'; // 状态 / 生成状态
}

// 测试
export type WorkflowBlock = WorkflowUserBlock | WorkflowAIBlock;

export function isUserBlock(b: WorkflowBlock): b is WorkflowUserBlock {
  return b.role === 'user';
}

export function isAIBlock(b: WorkflowBlock): b is WorkflowAIBlock {
  return b.role === 'ai';
}

// 转写与时间轴

// 转写片段（供时间轴与块关联）
export interface WorkflowTranscriptSegment {
  startTime: number;                    // 开始时间（时间戳）
  endTime: number;                      // 结束时间（时间戳）
  text: string;            
  blockId?: string;                     // 块 ID（可选） / 测试
  
  // 翻译
  originalLanguage?: string;            // 原始语言
  translatedText?: string;              // 翻译后的中文文本
  isTranslated?: boolean;               // 是否已翻译
}

// 录音会话
export interface WorkflowRecordingState {
  isRecording: boolean;                 // 是否录音中
  isCollapsed: boolean;                 // 是否折叠
  durationSeconds?: number;             // 录音时长（秒）
}
