/**
 * Workflow API
 * Base path: /api
 */

import type { WorkflowAttachment, WorkflowBlock, WorkflowFileRef } from '@/constants/workflow_type';

export const WORKFLOW_API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  details?: Record<string, unknown>;
}

// ----- 通用 -----

export interface WorkflowApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

type SessionCompatiblePayload = {
  sessionId?: string | null;
  id?: string | null;
};

function appendSessionCompatFields<T extends SessionCompatiblePayload>(payload: T): T {
  const sessionId = payload.sessionId ?? payload.id ?? undefined;
  const id = payload.id ?? payload.sessionId ?? undefined;

  return {
    ...payload,
    sessionId,
    id,
  };
}

async function parseApiJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  let result: ApiResponse<T>;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

function unwrapData<T>(result: ApiResponse<T>): T {
  if (typeof result.data === 'undefined') {
    throw new Error('服务器响应缺少 data 字段');
  }
  return result.data;
}

function normalizeTranscriptText(data: WorkflowTranscriptResponse): WorkflowTranscriptResponse {
  if (data.fullText) {
    return data;
  }

  const fullText = data.segments?.map(segment => segment.text).join('') ?? '';
  return {
    ...data,
    fullText,
  };
}

function createMultipartFile(file: { uri: string; name?: string; type?: string }) {
  return {
    uri: file.uri,
    name: file.name ?? 'upload.bin',
    type: file.type ?? 'application/octet-stream',
  } as any;
}

// ----- 1. 文本生成（追加 / 从某块重跑） -----

/** 生成请求：当前块序列上下文 + 操作类型 */
export interface WorkflowGenerateRequest extends SessionCompatiblePayload {
  /** 当前完整块列表（或后端要求的精简格式），用于上下文 */
  blocks: WorkflowBlock[];
  /** 操作类型：首问重跑 或 在指定块后追加 */
  action: 'regenerate_from_first' | 'append_after';
  /** append_after 时必填：在此 blockId 之后生成 */
  afterBlockId?: string;
}

/** 生成响应：单条 AI 内容（非流式） */
export interface WorkflowGenerateResponse {
  blockId: string;
  content: string;
  sourceBlockId: string;
  status: 'done';
  attachments?: WorkflowAttachment[];
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
export interface WorkflowSubmitInputRequest extends SessionCompatiblePayload {
  /** 纯文本输入 */
  text?: string;
  /** 上传后的文件引用（先走上传接口拿到 fileRef） */
  fileRef?: WorkflowFileRef;
  /** 当前块列表，用于上下文与顺序 */
  blocks: WorkflowBlock[];
}

/** 提交后后端可能直接返回新 user 块 + 触发生成的 AI 块，或仅确认，由前端追加 user 块并再调生成接口，依后端设计二选一 */
export interface WorkflowSubmitInputResponse {
  userBlockId: string;
  /** 若后端同步生成，则返回首条 AI 块；否则前端再调 generate */
  aiBlock?: WorkflowGenerateResponse;
}

// ----- 3. 文件上传 -----

export interface WorkflowUploadFileRequest extends SessionCompatiblePayload {
  file: { uri: string; name?: string; type?: string };
}

export interface WorkflowUploadFileResponse {
  fileRef: WorkflowFileRef;
}

// ----- 4. 录音与转写 -----

/** 上传音频或发起转写请求 */
export interface WorkflowTranscriptRequest extends SessionCompatiblePayload {
  /** 音频 URL 或上传后的 resourceId */
  audioUri?: string;
  audioResourceId?: string;
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

export interface WorkflowAudioUploadRequest extends SessionCompatiblePayload {
  file: { uri: string; name?: string; type?: string };
  durationMs?: number;
}

export interface WorkflowAudioUploadResponse {
  remoteAudioId: string;
  url?: string;
}

export interface WorkflowLongAudioTaskRequest extends SessionCompatiblePayload {
  audioResourceId?: string;
  audioUri?: string;
  durationMs?: number;
  prompt: string;
}

export interface WorkflowLongAudioTaskResponse {
  taskId?: string;
  sessionId?: string;
  accepted: boolean;
}

export interface WorkflowLongAudioTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sessionId?: string;
  result?: Record<string, unknown>;
  errorMessage?: string;
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
  lastModified?: number;
  recordedAudio?: {
    audioResourceId?: string;
    audioUri?: string;
    durationMs: number;
  };
}

// ----- 前端调用契约（接口描述 + 实现） -----

export interface IWorkflowApi {
  /** 提交用户输入（文本/文件），返回 userBlockId，可选返回首条 AI */
  submitInput(req: WorkflowSubmitInputRequest): Promise<WorkflowSubmitInputResponse>;

  /** 生成：从首块重跑 或 在指定块后追加 */
  generate(req: WorkflowGenerateRequest): Promise<WorkflowGenerateResponse>;

  /** 上传文件，返回 fileRef */
  uploadFile(req: WorkflowUploadFileRequest): Promise<WorkflowUploadFileResponse>;

  /** 上传音频文件，返回资源 id */
  uploadAudio(req: WorkflowAudioUploadRequest): Promise<WorkflowAudioUploadResponse>;

  /** 转写音频，返回带时间戳的 segments */
  transcript(req: WorkflowTranscriptRequest): Promise<WorkflowTranscriptResponse>;

  /** 长时录音任务：携带音频文件与固定提示词提交给后端 */
  submitLongAudioTask(req: WorkflowLongAudioTaskRequest): Promise<WorkflowLongAudioTaskResponse>;

  /** 查询长时录音任务状态 */
  getLongAudioTaskStatus(taskId: string): Promise<WorkflowLongAudioTaskStatus>;

  /** 获取会话块列表 */
  getSession(sessionId: string): Promise<WorkflowGetSessionResponse>;

  /** 列出当前用户会话摘要（可选） */
  listSessions?(userId?: string): Promise<WorkflowSessionSummary[]>;
}

/**
 * 获取 workflow 会话详情
 */
export async function getSession(sessionId: string): Promise<WorkflowGetSessionResponse> {
  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await parseApiJson<WorkflowGetSessionResponse>(response);
  const data = unwrapData(result);

  return {
    ...data,
    sessionId: data.sessionId ?? sessionId,
  };
}

/**
 * 提交 workflow 输入
 */
export async function submitInput(
  req: WorkflowSubmitInputRequest
): Promise<WorkflowSubmitInputResponse> {
  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/input`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appendSessionCompatFields(req)),
  });

  const result = await parseApiJson<WorkflowSubmitInputResponse>(response);
  return unwrapData(result);
}

/**
 * 请求 AI 生成
 */
export async function generate(req: WorkflowGenerateRequest): Promise<WorkflowGenerateResponse> {
  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appendSessionCompatFields(req)),
  });

  const result = await parseApiJson<WorkflowGenerateResponse>(response);
  return unwrapData(result);
}

/**
 * 上传 workflow 文件
 */
export async function uploadFile(
  req: WorkflowUploadFileRequest
): Promise<WorkflowUploadFileResponse> {
  const formData = new FormData();
  formData.append('file', createMultipartFile(req.file));

  const compat = appendSessionCompatFields(req);
  if (compat.sessionId) {
    formData.append('sessionId', compat.sessionId);
  }
  if (compat.id) {
    formData.append('id', compat.id);
  }

  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/file/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await parseApiJson<WorkflowUploadFileResponse>(response);
  return unwrapData(result);
}

/**
 * 上传 workflow 音频
 */
export async function uploadAudio(
  req: WorkflowAudioUploadRequest
): Promise<WorkflowAudioUploadResponse> {
  const formData = new FormData();
  formData.append('file', createMultipartFile(req.file));

  if (typeof req.durationMs === 'number') {
    formData.append('durationMs', String(req.durationMs));
  }

  const compat = appendSessionCompatFields(req);
  if (compat.sessionId) {
    formData.append('sessionId', compat.sessionId);
  }
  if (compat.id) {
    formData.append('id', compat.id);
  }

  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/audio/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await parseApiJson<
    WorkflowAudioUploadResponse & { audioResourceId?: string; id?: string }
  >(response);
  const data = unwrapData(result);

  return {
    remoteAudioId: data.remoteAudioId ?? data.audioResourceId ?? data.id ?? '',
    url: data.url,
  };
}

/**
 * 请求短录音转写
 */
export async function transcript(
  req: WorkflowTranscriptRequest
): Promise<WorkflowTranscriptResponse> {
  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/audio/transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appendSessionCompatFields(req)),
  });

  const result = await parseApiJson<WorkflowTranscriptResponse>(response);
  return normalizeTranscriptText(unwrapData(result));
}

/**
 * 提交长时录音任务
 */
export async function submitLongAudioTask(
  req: WorkflowLongAudioTaskRequest
): Promise<WorkflowLongAudioTaskResponse> {
  const response = await fetch(`${WORKFLOW_API_BASE}/workflow/audio/long-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appendSessionCompatFields(req)),
  });

  const result = await parseApiJson<WorkflowLongAudioTaskResponse>(response);
  const data = unwrapData(result);

  return {
    ...data,
    accepted: typeof data.accepted === 'boolean' ? data.accepted : true,
  };
}

/**
 * 查询长时录音任务状态
 */
export async function getLongAudioTaskStatus(
  taskId: string
): Promise<WorkflowLongAudioTaskStatus> {
  const response = await fetch(
    `${WORKFLOW_API_BASE}/workflow/audio/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const result = await parseApiJson<WorkflowLongAudioTaskStatus>(response);
  return unwrapData(result);
}

/**
 * Workflow API 对象，便于 service 统一注入
 */
export const workflowApi: IWorkflowApi = {
  submitInput,
  generate,
  uploadFile,
  uploadAudio,
  transcript,
  submitLongAudioTask,
  getLongAudioTaskStatus,
  getSession,
};

export default workflowApi;
