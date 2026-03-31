import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_SESSION_KEY = 'current_session_id';

export const SessionManager = {
  async getCurrentSessionId(): Promise<string | null> {
    return await AsyncStorage.getItem(CURRENT_SESSION_KEY);
  },

  async setCurrentSessionId(sessionId: string): Promise<void> {
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  },

  async clearCurrentSessionId(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
  }
};
