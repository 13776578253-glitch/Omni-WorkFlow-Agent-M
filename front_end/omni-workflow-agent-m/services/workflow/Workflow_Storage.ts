import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkflowMessage } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';

const STORAGE_KEY = '@omni_workflow_chat_history_v1';

export const WorkflowStorage = {
  /**
   * Save the current list of messages to local storage
   */
  saveMessages: async (messages: WorkflowMessage[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(messages);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  },

  /**
   * Load messages from local storage
   */
  loadMessages: async (): Promise<WorkflowMessage[] | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to load messages', e);
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
