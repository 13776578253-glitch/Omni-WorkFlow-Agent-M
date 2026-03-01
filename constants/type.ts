// (main)

// user
// data.tsx
export type PresetMode = 'custom' | 'concise' | 'formal';

export type PresetPrompts = Record<PresetMode, string>;

export type QuickActionPrompts = {
  solt1: string;
  solt2: string;
  solt3: string;
  solt4: string;
};

export type QuickActionNames = {
  solt1: string;
  solt2: string;
  solt3: string;
  solt4: string;
};

export interface UserDataState {
  presetMode: PresetMode;
  presetPrompts: PresetPrompts;
  quickActionNames: QuickActionNames;
  quickActionPrompts: QuickActionPrompts;
  // memoryPrompt: string;
  memoryContent: string;
}


// 棰勭暀鍚庣閫氫俊妯″瀷
export interface WorkflowHistory {
  id: string;
  title: string;
  timestamp: string;
  type: 'chat' | 'task' | 'agent';
}
