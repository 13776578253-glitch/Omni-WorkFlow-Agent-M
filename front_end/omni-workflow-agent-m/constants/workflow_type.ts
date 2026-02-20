/**
 * 工作流内容区专用类型定义
 * 与文档式可编辑块、展示模式、录音/转写等能力对齐
 */

// ----- 展示模式 -----

export type WorkflowMode = 'welcome' | 'recording' | 'document';

// ----- 块类型与内容 -----

export type BlockRole = 'user' | 'ai';

/** 文件引用（上传文件块） */
export interface WorkflowFileRef {
  url?: string;
  path?: string;
  mimeType?: string;
  fileName: string;
}

/** 用户块：文本或文件 */
export interface WorkflowUserBlock {
  id: string;
  role: 'user';
  content: string;
  fileRef?: WorkflowFileRef;
  createdAt: number;
  editedByUser?: boolean;
}

/** AI 块：生成文本，可被用户编辑 */
export interface WorkflowAIBlock {
  id: string;
  role: 'ai';
  content: string;
  createdAt: number;
  sourceBlockId: string;
  editedByUser?: boolean;
  status?: 'pending' | 'done' | 'error';
}

export type WorkflowBlock = WorkflowUserBlock | WorkflowAIBlock;

export function isUserBlock(b: WorkflowBlock): b is WorkflowUserBlock {
  return b.role === 'user';
}

export function isAIBlock(b: WorkflowBlock): b is WorkflowAIBlock {
  return b.role === 'ai';
}

// ----- 转写与时间轴 -----

/** 转写片段（供时间轴与块关联） */
export interface WorkflowTranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  blockId?: string;
}

// ----- 录音会话（可选，供 recording 模式） -----

export interface WorkflowRecordingState {
  isRecording: boolean;
  isCollapsed: boolean;
  durationSeconds?: number;
}
