import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkflowBlock } from '@/constants/workflow_type';

const STORAGE_KEY = '@omni_workflow_chat_history_v1';

export const WorkflowStorage = {
  /**
   * Save the current list of blocks to local storage
   */
  saveMessages: async (blocks: WorkflowBlock[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(blocks);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save blocks', e);
    }
  },

  /**
   * Load blocks from local storage with migration support
   */
  loadMessages: async (): Promise<WorkflowBlock[] | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (!jsonValue) return null;

      const data = JSON.parse(jsonValue);

      // 数据迁移：将旧格式 text 转换为新格式 content
      return data.map((item: any) => ({
        ...item,
        content: item.content || item.text || '',
        createdAt: item.createdAt || Date.now(),
      }));
    } catch (e) {
      console.error('Failed to load blocks', e);
      return null;
    }
  },

  /**
   * Clear all stored messages (useful for testing/reset)
   */
  clearMessages: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear messages', e);
    }
  }
};
