// (main)

// user
// data.tsx
export type PresetMode = 'custom' | 'concise' | 'formal';

export type PresetPrompts = Record<PresetMode, string>;

export type QuickActionPrompts = {
  ai_ppt: string;
  upload_audio: string;
  translate_secondary: string;
  slot_4: string;
};

export type QuickActionNames = {
  ai_ppt: string;
  upload_audio: string;
  translate_secondary: string;
  slot_4: string;
};

export interface UserDataState {
  presetMode: PresetMode;
  presetPrompts: PresetPrompts;
  quickActionNames: QuickActionNames;
  quickActionPrompts: QuickActionPrompts;
  memoryPrompt: string;
  memoryContent: string;
}


// 预留后端通信模型
export interface WorkflowHistory {
  id: string;
  title: string;
  timestamp: string;
  type: 'chat' | 'task' | 'agent';
}
