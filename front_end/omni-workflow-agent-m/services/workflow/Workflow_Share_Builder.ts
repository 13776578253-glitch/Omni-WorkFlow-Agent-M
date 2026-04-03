import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';

import type { UserDataState } from '@/constants/type';
import type {
  BuildWorkflowShareParams,
  WorkflowFinalResultShare,
  WorkflowSemanticSessionShare,
  WorkflowShareAIOutput,
  WorkflowShareAttachment,
  WorkflowShareDeliverable,
  WorkflowShareEditMark,
  WorkflowShareIntent,
  WorkflowShareThoughtChain,
  WorkflowShareTurn,
  WorkflowShareUserInput,
} from '@/constants/workflow_share';
import type {
  ThoughtChain,
  WorkflowAIBlock,
  WorkflowAttachment,
  WorkflowBlock,
  WorkflowUserBlock,
} from '@/constants/workflow_type';

import * as HistoryStorage from '@/services/history/History_Storage';
import { WorkflowStorage } from '@/services/workflow/Workflow_Storage';

const USER_DATA_STORAGE_KEY = '@omni_workflow_user_data_v1';

interface WorkflowShareSource {
  sessionId: string;
  title?: string;
  previewText?: string;
  createdAt?: number;
  isPinned?: boolean;
  blocks: WorkflowBlock[];
  personalization?: WorkflowShareIntent['personalization'];
}

function isUserBlock(block: WorkflowBlock): block is WorkflowUserBlock {
  return block.role === 'user';
}

function isAIBlock(block: WorkflowBlock): block is WorkflowAIBlock {
  return block.role === 'ai';
}

// 工具函数：文本清理、摘要生成、数据结构映射等
function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// 从 Markdown 文本中提取纯文本摘要，去除代码块、图片等非文本内容
function getSharePlatform(): 'android' | 'ios' | 'web' {
  if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web') {
    return Platform.OS;
  }
  return 'web';
}

// 清理 Markdown 中的特殊元素，保留基本文本内容，用于生成摘要或预览
function cleanMarkdownForSummary(value?: string | null): string {
  if (!value) return '';

  return normalizeWhitespace(
    value
      .replace(/```mermaid[\s\S]*?```/gi, ' [Mermaid 图表] ')
      .replace(/```[\s\S]*?```/g, ' [代码块] ')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
      .replace(/\[[^\]]+\]\([^)]+\)/g, '$1')
      .replace(/[#>*`~_-]+/g, ' ')
  );
}

function summarizeText(value?: string | null, maxLength = 120): string {
  const cleaned = cleanMarkdownForSummary(value);
  if (!cleaned) return '';
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength).trim()}...` : cleaned;
}

// 将内部数据结构映射为分享所需的格式，构建分享内容的核心逻辑
function mapAttachmentToShareAttachment(
  attachment: WorkflowAttachment
): WorkflowShareAttachment {
  return {
    id: attachment.id,
    type: attachment.type,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType ?? attachment.fileRef?.mimeType,
    fileSize: attachment.fileSize,
    url: attachment.fileRef?.url,
    path: attachment.fileRef?.path,
    localPath: attachment.localPath,
  };
}

function mapThoughtChain(chain?: ThoughtChain): WorkflowShareThoughtChain | undefined {
  if (!chain?.steps?.length) return undefined;
  return {
    id: chain.id,
    category: chain.category,
    steps: chain.steps.map((step) => ({
      text: step.text,
      type: step.type,
      status: step.status,
    })),
  };
}

function mapUserInput(block: WorkflowUserBlock): WorkflowShareUserInput {
  return {
    blockId: block.id,
    content: block.content,
    source: block.source,
    attachments: block.attachments?.map(mapAttachmentToShareAttachment),
    summaryContent: block.summaryContent,
    editedByUser: block.editedByUser,
  };
}

function mapAIOutput(block: WorkflowAIBlock): WorkflowShareAIOutput {
  return {
    blockId: block.id,
    content: block.content,
    status: block.status,
    attachments: block.attachments?.map(mapAttachmentToShareAttachment),
    editedByUser: block.editedByUser,
  };
}

function buildTimeline(blocks: WorkflowBlock[]): WorkflowShareTurn[] {
  const turns: WorkflowShareTurn[] = [];
  const aiBlocks = blocks.filter(isAIBlock);

  blocks.forEach((block, index) => {
    if (!isUserBlock(block)) {
      return;
    }

    const nextUserIndex = blocks.findIndex(
      (candidate, candidateIndex) => candidateIndex > index && isUserBlock(candidate)
    );

    const matchedAI = aiBlocks.find((candidate) => {
      if (candidate.sourceBlockId === block.id) {
        return true;
      }

      const candidateIndex = blocks.findIndex((item) => item.id === candidate.id);
      if (candidateIndex <= index) {
        return false;
      }
      if (nextUserIndex === -1) {
        return true;
      }
      return candidateIndex < nextUserIndex;
    });

    turns.push({
      turnId: `turn-${block.id}`,
      createdAt: block.createdAt,
      userInput: mapUserInput(block),
      aiOutput: matchedAI ? mapAIOutput(matchedAI) : undefined,
      thoughtChain: matchedAI ? mapThoughtChain(matchedAI.thoughtChain) : undefined,
    });
  });

  return turns;
}

// 构建编辑标记列表，标记用户在前端修改过的输入或 AI 输出，提供给分享内容用于说明哪些内容是经过用户编辑的最终版本
function buildEditMarks(blocks: WorkflowBlock[]): WorkflowShareEditMark[] {
  return blocks
    .filter((block) => block.editedByUser)
    .map((block) => ({
      targetBlockId: block.id,
      role: block.role,
      editedByUser: true as const,
      note:
        block.role === 'ai'
          ? '该 AI 输出在前端被用户手动修改过，当前导出内容为修改后的最终版本。'
          : '该用户输入在前端被用户重新编辑过，当前导出内容为编辑后的最终版本。',
    }));
}

// 从会话数据中提取个性化信息，构建分享内容的个性化摘要部分，帮助接收者快速了解会话中使用的预设、记忆等个性化设置
function extractPersonalizationSummary(
  personalization?: WorkflowShareIntent['personalization']
): string[] {
  if (!personalization) return [];

  const items: string[] = [];
  if (personalization.presetMode) {
    items.push(`当前预设模式：${personalization.presetMode}`);
  }
  if (personalization.presetPrompt) {
    items.push(`预设提示：${summarizeText(personalization.presetPrompt, 72)}`);
  }
  if (personalization.quickActionPrompt) {
    items.push(`快捷指令：${summarizeText(personalization.quickActionPrompt, 72)}`);
  }
  if (personalization.memoryContent) {
    items.push(`长期记忆：${summarizeText(personalization.memoryContent, 72)}`);
  }
  return items;
}

// 构建分享内容的意图部分，提取会话的首条用户输入或预览文本作为分享的核心意图描述，帮助接收者快速理解会话的主要目标和内容摘要
function buildIntent(source: WorkflowShareSource): WorkflowShareIntent {
  const firstUserBlock = source.blocks.find(isUserBlock);
  const sourcePrompt =
    firstUserBlock?.content?.trim() ||
    source.previewText?.trim() ||
    source.title?.trim() ||
    '未找到明确的首条用户输入';
  const userGoal =
    summarizeText(firstUserBlock?.content, 96) ||
    summarizeText(source.previewText, 96) ||
    source.title ||
    '未找到明确的用户目标';

  return {
    userGoal,
    sourcePrompt,
    personalization: source.personalization,
  };
}

function findLastEffectiveAIBlock(blocks: WorkflowBlock[]): WorkflowAIBlock | undefined {
  const aiBlocks = blocks.filter(isAIBlock);
  for (let index = aiBlocks.length - 1; index >= 0; index -= 1) {
    const candidate = aiBlocks[index];
    if (normalizeWhitespace(candidate.content)) {
      return candidate;
    }
  }
  return aiBlocks.find((candidate) => candidate.status === 'done');
}

function buildDeliverables(blocks: WorkflowBlock[]): WorkflowShareDeliverable[] {
  const finalAIBlock = findLastEffectiveAIBlock(blocks);
  if (!finalAIBlock) {
    return [];
  }

  const deliverables: WorkflowShareDeliverable[] = [];
  if (normalizeWhitespace(finalAIBlock.content)) {
    deliverables.push({
      id: `deliverable-text-${finalAIBlock.id}`,
      kind: 'final_text',
      title: '最终输出',
      content: finalAIBlock.content,
      attachments: finalAIBlock.attachments?.map(mapAttachmentToShareAttachment),
    });
  }

  if (finalAIBlock.attachments?.length) {
    deliverables.push({
      id: `deliverable-file-${finalAIBlock.id}`,
      kind: 'generated_file',
      title: '生成附件',
      attachments: finalAIBlock.attachments.map(mapAttachmentToShareAttachment),
    });
  }

  return deliverables;
}

function buildSemanticSummary(
  source: WorkflowShareSource,
  turns: WorkflowShareTurn[]
) {
  const firstUserBlock = source.blocks.find(isUserBlock);
  const aiBlocks = source.blocks.filter(isAIBlock);
  const finalAIBlock = findLastEffectiveAIBlock(source.blocks);

  const keyInputs = [
    ...turns
      .map((turn) => turn.userInput?.content)
      .filter(Boolean)
      .map((content) => `用户输入：${summarizeText(content, 96)}`),
    ...turns.flatMap((turn) =>
      (turn.userInput?.attachments ?? []).map(
        (attachment) => `用户附件：${attachment.fileName}${attachment.mimeType ? ` (${attachment.mimeType})` : ''}`
      )
    ),
    ...extractPersonalizationSummary(source.personalization),
  ];

  const thoughtSteps = aiBlocks.flatMap((block) =>
    block.thoughtChain?.steps?.map((step) => step.text).filter(Boolean) ?? []
  );
  const keyOperations = Array.from(
    new Set(
      thoughtSteps.length > 0
        ? thoughtSteps.map((step) => summarizeText(step, 80)).filter(Boolean)
        : [
            firstUserBlock ? '整理用户输入并生成结构化结果' : '',
            aiBlocks.some((block) => block.attachments?.length) ? '生成附件结果' : '',
            aiBlocks.length > 0 ? '生成 AI 输出' : '',
          ].filter(Boolean)
    )
  );

  const keyOutputs = [
    ...aiBlocks
      .map((block) => summarizeText(block.content, 96))
      .filter(Boolean)
      .map((summary) => `AI 输出：${summary}`),
    ...aiBlocks.flatMap((block) =>
      (block.attachments ?? []).map(
        (attachment) => `AI 附件：${attachment.fileName}${attachment.mimeType ? ` (${attachment.mimeType})` : ''}`
      )
    ),
  ];

  const finalOutcome =
    finalAIBlock
      ? [
          summarizeText(finalAIBlock.content, 120),
          finalAIBlock.attachments?.length ? `并附带 ${finalAIBlock.attachments.length} 个附件` : '',
        ]
          .filter(Boolean)
          .join('，')
      : summarizeText(source.previewText, 120) || source.title || '当前会话尚未生成明确结果';

  return {
    goal:
      summarizeText(firstUserBlock?.content, 96) ||
      summarizeText(source.previewText, 96) ||
      source.title ||
      '未找到明确目标',
    keyInputs,
    keyOperations,
    keyOutputs,
    finalOutcome,
  };
}

async function loadPersonalization(): Promise<WorkflowShareIntent['personalization']> {
  try {
    const raw = await AsyncStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as Partial<UserDataState>;
    const presetMode = parsed.presetMode;
    const presetPrompt = presetMode ? parsed.presetPrompts?.[presetMode] : undefined;

    return {
      presetMode,
      presetPrompt,
      memoryContent: parsed.memoryContent,
    };
  } catch {
    return undefined;
  }
}

export async function loadShareSourceForSession(sessionId: string): Promise<WorkflowShareSource> {
  const [blocksFromStorage, sessions, personalization] = await Promise.all([
    WorkflowStorage.loadMessages(sessionId),
    HistoryStorage.loadSessions(),
    loadPersonalization(),
  ]);

  const historySession = sessions.find((session) => session.id === sessionId);
  const blocks =
    (blocksFromStorage && blocksFromStorage.length > 0 ? blocksFromStorage : null) ??
    historySession?.workflowData?.blocks ??
    [];

  return {
    sessionId,
    title: historySession?.title,
    previewText: historySession?.previewText,
    createdAt: historySession?.createdAt,
    isPinned: historySession?.isPinned,
    blocks,
    personalization,
  };
}

export async function buildFinalResultSharePayload(
  source: WorkflowShareSource
): Promise<WorkflowFinalResultShare> {
  const intent = buildIntent(source);
  const latestUserBlock = [...source.blocks].reverse().find(isUserBlock);
  const finalAIBlock = findLastEffectiveAIBlock(source.blocks);
  const finalAttachments = finalAIBlock?.attachments?.map(mapAttachmentToShareAttachment);

  return {
    schemaVersion: '1.0',
    shareType: 'final_result',
    exportedAt: Date.now(),
    source: {
      app: 'omni-workflow-agent-m',
      platform: getSharePlatform(),
      sessionId: source.sessionId,
      title: source.title,
    },
    intent,
    finalResult: {
      id: finalAIBlock ? `deliverable-text-${finalAIBlock.id}` : `deliverable-fallback-${source.sessionId}`,
      kind: finalAttachments?.length ? 'generated_file' : 'final_text',
      title: '最终输出',
      content:
        finalAIBlock?.content ||
        source.previewText ||
        source.title ||
        '当前会话尚未生成明确的最终结果。',
      attachments: finalAttachments,
    },
    supportingContext: {
      latestUserInput: latestUserBlock ? mapUserInput(latestUserBlock) : undefined,
      finalThoughtChain: finalAIBlock ? mapThoughtChain(finalAIBlock.thoughtChain) : undefined,
      attachments:
        finalAttachments && finalAttachments.length > 0
          ? finalAttachments
          : latestUserBlock?.attachments?.map(mapAttachmentToShareAttachment),
    },
  };
}

export async function buildSemanticSessionSharePayload(
  source: WorkflowShareSource
): Promise<WorkflowSemanticSessionShare> {
  const intent = buildIntent(source);
  const timeline = buildTimeline(source.blocks);
  const deliverables = buildDeliverables(source.blocks);
  const editMarks = buildEditMarks(source.blocks);

  return {
    schemaVersion: '1.0',
    shareType: 'session_semantic',
    exportedAt: Date.now(),
    source: {
      app: 'omni-workflow-agent-m',
      platform: getSharePlatform(),
      sessionId: source.sessionId,
      title: source.title,
    },
    intent,
    semanticSummary: buildSemanticSummary(source, timeline),
    timeline,
    deliverables,
    editMarks,
  };
}

export async function buildWorkflowSharePayload(
  params: BuildWorkflowShareParams
): Promise<WorkflowFinalResultShare | WorkflowSemanticSessionShare> {
  const source = await loadShareSourceForSession(params.sessionId);

  if (params.shareType === 'final_result') {
    return buildFinalResultSharePayload(source);
  }

  return buildSemanticSessionSharePayload(source);
}

export async function buildWorkflowSharePayloadText(
  params: BuildWorkflowShareParams
): Promise<string> {
  const payload = await buildWorkflowSharePayload(params);
  return JSON.stringify(payload, null, 2);
}

// 构建分享内容的核心函数，负责根据会话 ID 加载会话数据，构建符合分享规范的内容结构，并将其转换为 JSON 文本，准备进行分享操作
export async function shareWorkflowSessionPayload(
  params: BuildWorkflowShareParams
): Promise<void> {
  const payload = await buildWorkflowSharePayload(params);
  const payloadText = JSON.stringify(payload, null, 2);
  const title = payload.source.title || params.sessionId;

  await Share.share({
    title: `${title}.json`,
    message: payloadText,
  });
}

export type { WorkflowShareSource };
