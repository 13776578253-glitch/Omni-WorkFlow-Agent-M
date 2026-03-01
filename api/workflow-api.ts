/**
 * 工作流与后端 API 接口约定（初步拟定）
 * 仅定义请求/响应类型与语义，具体 baseURL、fetch 封装由调用方或 api 层统一实现
 */

import type { WorkflowBlock, WorkflowFileRef } from '@/constants/workflow_type';

// ----- 通用 -----

export interface WorkflowApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ----- 1. 文本生成（追加 / 从某块重跑） -----

/** 生成请求：当前块序列上下文 + 操作类型 */
export interface WorkflowGenerateRequest {
  /** 当前完整块列表（或后端要求的精简格式），用于上下文 */
  blocks: WorkflowBlock[];
  /** 操作类型：首问重跑 或 在指定块后追加 */
  action: 'regenerate_from_first' | 'append_after';
  /** append_after 时必填：在此 blockId 之后生成 */
  afterBlockId?: string;
  /** 可选：会话/工作流 id，多轮复用 */
  sessionId?: string;
}

/** 生成响应：单条 AI 内容（非流式） */
export interface WorkflowGenerateResponse {
  blockId: string;
  content: string;
  sourceBlockId: string;
  status: 'done';
}

/** 流式 chunk（若后端支持 SSE/WebSocket） */
export interface WorkflowGenerateStreamChunk {
  type: 'delta' | 'done';
  content?: string;
  blockId?: string;
  sourceBlockId?: string;
}

// ----- 2. 用户输入提交（文本 / 文件） -----

/** 提交用户内容请求 */
export interface WorkflowSubmitInputRequest {
  /** 纯文本输入 */
  text?: string;
  /** 上传后的文件引用（先走上传接口拿到 fileRef） */
  fileRef?: WorkflowFileRef;
  /** 当前块列表，用于上下文与顺序 */
  blocks: WorkflowBlock[];
  sessionId?: string;
}

/** 提交后后端可能直接返回新 user 块 + 触发生成的 AI 块，或仅确认，由前端追加 user 块并再调生成接口，依后端设计二选一 */
export interface WorkflowSubmitInputResponse {
  userBlockId: string;
  /** 若后端同步生成，则返回首条 AI 块；否则前端再调 generate */
  aiBlock?: WorkflowGenerateResponse;
}

// ----- 3. 文件上传 -----

export interface WorkflowUploadFileRequest {
  file: { uri: string; name?: string; type?: string };
  sessionId?: string;
}

export interface WorkflowUploadFileResponse {
  fileRef: WorkflowFileRef;
}

// ----- 4. 录音与转写 -----

/** 上传音频或发起转写请求 */
export interface WorkflowTranscriptRequest {
  /** 音频 URL 或上传后的 resourceId */
  audioUri?: string;
  audioResourceId?: string;
  sessionId?: string;
}

export interface WorkflowTranscriptSegmentDto {
  startTime: number;
  endTime: number;
  text: string;
}

export interface WorkflowTranscriptResponse {
  segments: WorkflowTranscriptSegmentDto[];
  /** 可选：整段转写文本，可直接作为首块 content */
  fullText?: string;
}

// ----- 5. 会话/历史（可选） -----

export interface WorkflowSessionSummary {
  sessionId: string;
  title?: string;
  updatedAt: number;
  blockCount?: number;
}

/** 拉取某会话的块列表（用于恢复或历史） */
export interface WorkflowGetSessionResponse {
  sessionId: string;
  blocks: WorkflowBlock[];
}

// ----- 前端调用契约（接口描述，不包含实现） -----

export interface IWorkflowApi {
  /** 提交用户输入（文本/文件），返回 userBlockId，可选返回首条 AI */
  submitInput(req: WorkflowSubmitInputRequest): Promise<WorkflowSubmitInputResponse>;

  /** 生成：从首块重跑 或 在指定块后追加 */
  generate(req: WorkflowGenerateRequest): Promise<WorkflowGenerateResponse>;

  /** 上传文件，返回 fileRef */
  uploadFile(req: WorkflowUploadFileRequest): Promise<WorkflowUploadFileResponse>;

  /** 转写音频，返回带时间戳的 segments */
  transcript(req: WorkflowTranscriptRequest): Promise<WorkflowTranscriptResponse>;

  /** 获取会话块列表（可选） */
  getSession?(sessionId: string): Promise<WorkflowGetSessionResponse>;

  /** 列出当前用户会话摘要（可选） */
  listSessions?(): Promise<WorkflowSessionSummary[]>;
}
