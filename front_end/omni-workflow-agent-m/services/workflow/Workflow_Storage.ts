import type { WorkflowBlock } from '@/constants/workflow_type';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@omni_workflow_chat_history_v1';

const getStorageKey = (sessionId: string) => `${STORAGE_KEY_PREFIX}_${sessionId}`;

export const WorkflowStorage = {
  /**
   * Save the current list of blocks to local storage for a specific session
   */
  saveMessages: async (blocks: WorkflowBlock[], sessionId: string): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(blocks);
      await AsyncStorage.setItem(getStorageKey(sessionId), jsonValue);
    } catch (e) {
      console.error('Failed to save blocks', e);
    }
  },

  /**
   * Load blocks from local storage with migration support for a specific session
   */
  loadMessages: async (sessionId: string): Promise<WorkflowBlock[] | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(getStorageKey(sessionId));
      if (!jsonValue) return null;

      const data = JSON.parse(jsonValue);

      // 数据迁移：将旧格式 text 转换为新格式 content
      return data.map((item: any) => ({
        ...item,
        content: item.content || item.text || '',
        createdAt: item.createdAt || Date.now(),
        // 对于 AI 消息，如果动画状态字段不存在，则默认认为动画已播放（兼容旧数据）
        thoughtChainAnimationPlayed:
          item.role === 'ai'
            ? (typeof item.thoughtChainAnimationPlayed === 'boolean' ? item.thoughtChainAnimationPlayed : true)
            : item.thoughtChainAnimationPlayed,
        messageAnimationPlayed:
          item.role === 'ai'
            ? (typeof item.messageAnimationPlayed === 'boolean' ? item.messageAnimationPlayed : true)
            : item.messageAnimationPlayed,
      }));
    } catch (e) {
      console.error('Failed to load blocks', e);
      return null;
    }
  },

  /**
   * Clear all stored messages for a specific session (useful for testing/reset)
   */
  clearMessages: async (sessionId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(getStorageKey(sessionId));
    } catch (e) {
      console.error('Failed to clear messages', e);
    }
  }
};
