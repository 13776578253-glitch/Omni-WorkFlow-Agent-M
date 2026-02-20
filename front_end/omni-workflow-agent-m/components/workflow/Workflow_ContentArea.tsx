import React from 'react';
import { View } from 'react-native';

import {
  type WorkflowBlock,
  type WorkflowMode,
  type WorkflowRecordingState,
  type WorkflowTranscriptSegment,
} from '@/constants/workflow_type';

interface WorkflowContentAreaProps {
  mode: WorkflowMode;
  blocks: WorkflowBlock[];
  firstQuestionLocked: boolean;
  recordingState: WorkflowRecordingState;
  transcriptSegments: WorkflowTranscriptSegment[];
  editingBlockId: string | null;
  editingText: string;
  onStartEdit: (block: WorkflowBlock, index: number) => void;
  onEditingTextChange: (text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkflowContentArea(_props: WorkflowContentAreaProps) {
  return <View style={{ flex: 1 }} />;
}
