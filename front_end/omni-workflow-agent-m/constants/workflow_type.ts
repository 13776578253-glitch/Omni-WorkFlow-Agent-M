// workflow 类型定义

// 展示模式 ：welcome（首次进入）、recording（录音转写）、document（文档编辑）
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

// 附件类型（用于输入栏和消息显示）
export interface WorkflowAttachment {
  id: string;
  type: 'image' | 'file';
  fileName: string;
  fileSize?: number;           // 文件大小（可选）
  mimeType?: string;           // MIME 类型（可选）
  localPath?: string;          // 本地文件路径（可选）/ 上传前使用
  thumbnailUri?: string;       // 缩略图 URI（可选）/ 图片预览使用
  fileRef?: WorkflowFileRef;   // 上传成功后关联的文件引用
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

// user block：文本或文件
export interface WorkflowUserBlock {
  id: string;
  role: 'user';
  content: string;                       // 内容  / 输入文本
  fileRef?: WorkflowFileRef;             // 文件引用（可选）
  attachments?: WorkflowAttachment[];    // 附件列表（可选）
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

// 思维链步骤
export interface ThoughtStep {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  type: 'command' | 'summary' | 'text';
  icon?: string;
  timestamp?: number;
}

// 思维链
export interface ThoughtChain {
  id: string;
  steps: ThoughtStep[];
  category: string;
}

// AI block：生成文本，可被用户编辑
export interface WorkflowAIBlock {
  id: string;
  role: 'ai';
  content: string;                       // 内容  / 输出文本
  createdAt: number;                     // 创建时间（时间戳）
  sourceBlockId: string;                 // 源块 ID（可选） / 测试
  attachments?: WorkflowAttachment[];    // AI 输出附件（可选）
  editedByUser?: boolean;                // 是否被用户编辑（可选） / 测试
  status?: 'pending' | 'done' | 'error'; // 状态 / 生成状态
  thoughtChain?: ThoughtChain;           // 思维链（可选）
  thoughtChainAnimationPlayed?: boolean; // 思维链动画是否已播过
  messageAnimationPlayed?: boolean;      // 正文动画是否已播过
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

// 录音模式
export type WorkflowRecordingMode = 'press-to-talk' | 'long-form';
// 录音来源
export type WorkflowRecordingSource = 'home-press' | 'workflow-press' | 'workflow-long-form';
// 录音转写策略
export type WorkflowTranscriptStrategy = 'mock_only' | 'api_then_mock_fallback';

// 输入区域
// 短时录音 (按住说话)
// 录音状态
export type WorkflowRecordingPhase = 
    'idle'                              // 空闲
  | 'requesting_permission'             // 请求权限 (可选)
  | 'recording'                         // 正在录音
  | 'stopping'                          // 停止录音 / 保存 (可选)
  | 'uploading'                         // 上传
  | 'transcribing'                      // 处理
  | 'completed'                         // 完成 / 播报 (可选)
  | 'error';                            // 异常

  // 单次录音会话 信息
export interface WorkflowRecordingSession {
  sessionId: string;
  mode: WorkflowRecordingMode;          // 录音模式
  source: WorkflowRecordingSource;      // 录音来源
  phase: WorkflowRecordingPhase;        // 所处阶段
  startedAt: number;
  stoppedAt?: number;
  durationMs?: number;                  // 录音时长
  localUrl?: string;                    // 本地缓存路径
  remoteAudioId?: string;               // 返回 ID (可选)
  errorMessage?: string;                // 错误信息 (可选)
}

// 录音文件 参数
export interface WorkflowRecordingUploadPayload {
  url: string;                          // 本地缓存路径
  fileName: string;                     // 文件名
  mimeType: string;                     // 类型
  durationMs?: number;                  // 时长
}

export interface WorkflowRecordingPipelineResult {
  session: WorkflowRecordingSession;                  // 录音 完整会话信息
  transcriptText: string;                             // 文字
  // transcriptSegments: WorkflowTranscriptSegment[];
}

// 录音预览
export interface WorkflowRecordedAudioPreview {
  audioUri: string;
  durationMs: number;
  remoteAudioId?: string | null;
  sourceMode: 'long-form';
}

export interface WorkflowPendingLongAudioInput extends WorkflowRecordedAudioPreview {
  prompt: string;
  origin: 'recorded' | 'uploaded-audio';
  fileName?: string;
  mimeType?: string;
}

export interface WorkflowLongAudioTaskPayload {
  audio: WorkflowRecordedAudioPreview;
  prompt: string;
}

// AI 状态文本辅助函数
export function getAIStatusText(status?: 'pending' | 'done' | 'error'): string {
  if (status === 'pending') return '正在思考...';
  if (status === 'error') return '生成失败';
  return '';
}

// History Session 扩展（包含完整 workflow 数据）
export interface ExtendedHistorySession {
  id: string;
  title: string;
  createdAt: number;
  isPinned: boolean;
  previewText?: string;
  workflowData?: {
    blocks: WorkflowBlock[];
    lastModified: number;
  };
}
