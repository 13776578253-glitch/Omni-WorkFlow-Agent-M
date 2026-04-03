import type { WorkflowAttachment } from '@/constants/workflow_type';

export type WorkflowShareType = 'final_result' | 'session_semantic';

export interface WorkflowShareEnvelope {
  schemaVersion: '1.0';
  shareType: WorkflowShareType;
  exportedAt: number;
  source: {
    app: 'omni-workflow-agent-m';
    platform?: 'android' | 'ios' | 'web';
    sessionId: string;
    title?: string;
  };
}

export interface WorkflowShareIntent {
  userGoal: string;
  sourcePrompt: string;
  personalization?: {
    presetMode?: string;
    presetPrompt?: string;
    quickActionKey?: string;
    quickActionPrompt?: string;
    memoryContent?: string;
  };
}

export interface WorkflowSemanticSummary {
  goal: string;
  keyInputs: string[];
  keyOperations: string[];
  keyOutputs: string[];
  finalOutcome: string;
}

export interface WorkflowShareThoughtStep {
  text: string;
  type?: 'command' | 'summary' | 'text';
  status?: 'pending' | 'active' | 'completed' | 'error';
}

export interface WorkflowShareThoughtChain {
  id?: string;
  category?: string;
  steps: WorkflowShareThoughtStep[];
}

export interface WorkflowShareAttachment {
  id?: string;
  type: WorkflowAttachment['type'];
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  url?: string;
  path?: string;
  localPath?: string;
}

export interface WorkflowShareUserInput {
  blockId: string;
  content: string;
  source?: 'transcript' | 'uploaded_file' | 'manual_input';
  attachments?: WorkflowShareAttachment[];
  summaryContent?: string;
  editedByUser?: boolean;
}

export interface WorkflowShareAIOutput {
  blockId: string;
  content: string;
  status?: 'pending' | 'done' | 'error';
  attachments?: WorkflowShareAttachment[];
  editedByUser?: boolean;
}

export interface WorkflowShareTurn {
  turnId: string;
  createdAt?: number;
  userInput?: WorkflowShareUserInput;
  aiOutput?: WorkflowShareAIOutput;
  thoughtChain?: WorkflowShareThoughtChain;
}

export interface WorkflowShareDeliverable {
  id: string;
  kind: 'final_text' | 'generated_file';
  title: string;
  content?: string;
  attachments?: WorkflowShareAttachment[];
}

export interface WorkflowShareEditMark {
  targetBlockId: string;
  role: 'user' | 'ai';
  editedByUser: true;
  note: string;
}

export interface WorkflowFinalResultShare extends WorkflowShareEnvelope {
  shareType: 'final_result';
  intent: WorkflowShareIntent;
  finalResult: WorkflowShareDeliverable;
  supportingContext: {
    latestUserInput?: WorkflowShareUserInput;
    finalThoughtChain?: WorkflowShareThoughtChain;
    attachments?: WorkflowShareAttachment[];
  };
}

export interface WorkflowSemanticSessionShare extends WorkflowShareEnvelope {
  shareType: 'session_semantic';
  intent: WorkflowShareIntent;
  semanticSummary: WorkflowSemanticSummary;
  timeline: WorkflowShareTurn[];
  deliverables: WorkflowShareDeliverable[];
  editMarks: WorkflowShareEditMark[];
}

export interface BuildWorkflowShareParams {
  sessionId: string;
  shareType: WorkflowShareType;
}
