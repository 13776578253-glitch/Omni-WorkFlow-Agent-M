import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';
const DEMO_ADMIN_USER_ID = 'cpp';
const DEMO_ADMIN_NICKNAME = 'cpp';
const DEMO_ADMIN_PHONE = '17768288913';

export interface StoredAuthState {
  isLoggedIn?: boolean;
  userId?: string;
  nickname?: string;
  phone?: string;
  updatedAt?: number;
}

function normalizePhone(phone?: string): string {
  return (phone ?? '').replace(/\D/g, '');
}

export function isDemoCppAuthState(authState?: StoredAuthState | null): boolean {
  if (!authState?.isLoggedIn) {
    return false;
  }

  return (
    authState.userId === DEMO_ADMIN_USER_ID ||
    authState.nickname === DEMO_ADMIN_NICKNAME ||
    normalizePhone(authState.phone) === DEMO_ADMIN_PHONE
  );
}

export function getEffectiveUserIdFromAuthState(authState?: StoredAuthState | null): string | null {
  if (!authState?.isLoggedIn) {
    return null;
  }

  if (authState.userId) {
    return String(authState.userId);
  }

  if (isDemoCppAuthState(authState)) {
    return DEMO_ADMIN_USER_ID;
  }

  return null;
}

export async function getStoredAuthState(): Promise<StoredAuthState | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthState;
  } catch {
    return null;
  }
}

export async function getEffectiveUserId(): Promise<string | null> {
  const authState = await getStoredAuthState();
  return getEffectiveUserIdFromAuthState(authState);
}

export async function isDemoCppUserLoggedIn(): Promise<boolean> {
  const authState = await getStoredAuthState();
  return isDemoCppAuthState(authState);
}

export const demoUserConfig = {
  userId: DEMO_ADMIN_USER_ID,
  nickname: DEMO_ADMIN_NICKNAME,
  phone: DEMO_ADMIN_PHONE,
};
