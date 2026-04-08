import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { AuthForgot } from '@/components/user/auth/forgot';
import { AuthIsLogin } from '@/components/user/auth/islogin';
import { AuthLogin } from '@/components/user/auth/login';
import { AuthRegister } from '@/components/user/auth/register';
import { AuthValidation } from '@/components/user/auth/validation';
import { KeyboardAwareScroll } from '@/components/user/personal/Keyboard_Aware_Scroll';
import { useThemeColor } from '@/hooks/use-theme-color';

const STORAGE_KEY = '@omni_workflow_user_data_v1';
const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';
const AUTH_LINK_KEY = '@omni_workflow_user_data_v1_auth_link';
const DEMO_AUTH_USERS_KEY = '@omni_workflow_demo_auth_users_v1';

// 固定验证码 / 测试账号
const DEMO_VERIFICATION_CODE = '147653';
const ADMIN_ACCOUNT = {
  id: 'admin-001',
  nickname: 'cpp',
  phone: '17768288913',
  password: '1141128',
} as const;

type AuthMode = 'login' | 'register' | 'forgot' | 'validation';

interface AuthState {
  isLoggedIn: boolean;
  nickname: string;
  phone: string;
  updatedAt: number;
}

interface PendingValidation {
  phone: string;
  nickname: string;
  method: 'code' | 'password';
}

// 本地认证逻辑
interface DemoAuthUser {
  id: string;
  nickname: string;
  phone: string;
  password: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function createDemoUserId(): string {
  return `cpp`;
}

async function readDemoUsers(): Promise<DemoAuthUser[]> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_AUTH_USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoAuthUser[]) : [];
    const users = Array.isArray(parsed) ? parsed : [];
    const hasAdmin = users.some((user) => normalizePhone(user.phone) === ADMIN_ACCOUNT.phone);

    if (hasAdmin) {
      return users;
    }

    return [ADMIN_ACCOUNT, ...users];
  } catch {
    return [ADMIN_ACCOUNT];
  }
}

// 写入用户列表，包含新增或更新单个用户的逻辑
async function writeDemoUsers(users: DemoAuthUser[]): Promise<void> {
  await AsyncStorage.setItem(DEMO_AUTH_USERS_KEY, JSON.stringify(users));
}

// 根据手机号查找用户，返回 undefined 表示未找到
async function findDemoUserByPhone(phone: string): Promise<DemoAuthUser | undefined> {
  const users = await readDemoUsers();
  const normalizedPhone = normalizePhone(phone);
  return users.find((user) => normalizePhone(user.phone) === normalizedPhone);
}

// 保存用户信息，若手机号已存在则更新用户信息，否则新增用户
async function saveDemoUser(nextUser: DemoAuthUser): Promise<void> {
  const users = await readDemoUsers();
  const normalizedPhone = normalizePhone(nextUser.phone);
  const nextUsers = users.some((user) => normalizePhone(user.phone) === normalizedPhone)
    ? users.map((user) => (normalizePhone(user.phone) === normalizedPhone ? nextUser : user))
    : [nextUser, ...users];
  await writeDemoUsers(nextUsers);
}

export default function AuthScreen() {
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000000' }, 'background');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const borderColor = useThemeColor({}, 'border');

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [countdown, setCountdown] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [cachedPhone, setCachedPhone] = useState('');
  const [cachedNickname, setCachedNickname] = useState('');
  const [pendingValidation, setPendingValidation] = useState<PendingValidation | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    nickname: '',
    phone: '',
    updatedAt: Date.now(),
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const loadAuthState = async () => {
        try {
          const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
          if (!mounted) return;
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<AuthState>;
            const nextState: AuthState = {
              isLoggedIn: !!parsed.isLoggedIn,
              nickname: parsed.nickname ?? '',
              phone: parsed.phone ?? '',
              updatedAt: parsed.updatedAt ?? Date.now(),
            };
            setAuthState(nextState);
            setCachedNickname(nextState.nickname);
            setCachedPhone(nextState.phone);
          }
        } finally {
          if (mounted) setLoaded(true);
        }
      };
      void loadAuthState();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const saveAuthState = useCallback(async (next: AuthState) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(AUTH_LINK_KEY, STORAGE_KEY);
  }, []);

  const handleSendCode = useCallback(async (phone: string) => {
    if (countdown > 0) return;
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 11) {
      Alert.alert('发送失败', '请输入 11 位手机号。');
      return;
    }

    setCountdown(60);
    Alert.alert('验证码已发送');
  }, [countdown]);

  const switchToLogin = useCallback(() => {
    setAuthMode('login');
    setCountdown(0);
    setPendingValidation(null);
  }, []);

  const handleLoginSubmit = useCallback(
    async (payload: { variant: 'phone'; phone: string; nickname: string; code: string; method: 'code' | 'password' }) => {
      if (payload.method === 'code') {
        await handleSendCode(payload.phone);
      }
      setPendingValidation({
        phone: payload.phone,
        method: payload.method,
        nickname: payload.nickname,
      });
      setAuthMode('validation');
    },
    [handleSendCode]
  );

  const handleValidationComplete = useCallback(
    async (payload: { phone: string; nickname: string; password?: string; code?: string }) => {
      try {
        const normalizedPhone = normalizePhone(payload.phone);
        const user = await findDemoUserByPhone(normalizedPhone);

        if (pendingValidation?.method === 'code') {
          if (payload.code !== DEMO_VERIFICATION_CODE) {
            throw new Error('验证码错误，请输入 147653。');
          }
        } else if (!user || user.password !== (payload.password || '')) {
          throw new Error('手机号或密码错误。');
        }

        if (!user) {
          throw new Error('账号不存在，请先注册。');
        }

        const nextState: AuthState = {
          isLoggedIn: true,
          nickname: user.nickname,
          phone: normalizedPhone,
          updatedAt: Date.now(),
        };
        await saveAuthState(nextState);
        setAuthState(nextState);
        setCachedNickname(nextState.nickname);
        setCachedPhone(nextState.phone);
        setPendingValidation(null);
        setAuthMode('login');
      } catch (error) {
        Alert.alert('登录失败', error instanceof Error ? error.message : '请稍后重试。');
      }
    },
    [saveAuthState, pendingValidation]
  );

  const handleRegisterSubmit = useCallback(
    async (payload: { nickname: string; password: string; phone: string; code: string }) => {
      try {
        const normalizedPhone = normalizePhone(payload.phone);
        if (payload.code !== DEMO_VERIFICATION_CODE) {
          throw new Error('验证码错误，请输入 147653。');
        }

        const existingUser = await findDemoUserByPhone(normalizedPhone);
        if (existingUser) {
          throw new Error('该手机号已注册。');
        }

        await saveDemoUser({
          id: createDemoUserId(),
          nickname: payload.nickname,
          phone: normalizedPhone,
          password: payload.password,
        });

        const nextState: AuthState = {
          isLoggedIn: false,
          nickname: payload.nickname,
          phone: normalizedPhone,
          updatedAt: Date.now(),
        };
        await saveAuthState(nextState);
        setCachedNickname(nextState.nickname);
        setCachedPhone(nextState.phone);
        Alert.alert('注册成功', '请使用验证码登录。');
        switchToLogin();
      } catch (error) {
        Alert.alert('注册失败', error instanceof Error ? error.message : '请稍后重试。');
      }
    },
    [saveAuthState, switchToLogin]
  );

  const handleLogout = useCallback(async () => {
    try {
      const nextState: AuthState = {
        isLoggedIn: false,
        nickname: '',
        phone: '',
        updatedAt: Date.now(),
      };
      await saveAuthState(nextState);
      setAuthState(nextState);
      setCachedNickname('');
      setCachedPhone('');
      switchToLogin();
      Alert.alert('已退出', '账号已退出登录。');
    } catch (error) {
      Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试。');
    }
  }, [saveAuthState, switchToLogin]);

  const handleForgotSubmit = useCallback(
    async (payload: { phone: string; code: string; newPassword: string }) => {
      try {
        const normalizedPhone = normalizePhone(payload.phone);
        if (payload.code !== DEMO_VERIFICATION_CODE) {
          throw new Error('验证码错误，请输入 147653。');
        }

        const existingUser = await findDemoUserByPhone(normalizedPhone);
        if (!existingUser) {
          throw new Error('账号不存在，请先注册。');
        }

        await saveDemoUser({
          ...existingUser,
          password: payload.newPassword,
        });

        Alert.alert('修改成功', '请重新登录。');
        switchToLogin();
      } catch (error) {
        Alert.alert('修改失败', error instanceof Error ? error.message : '请稍后重试。');
      }
    },
    [switchToLogin]
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <KeyboardAwareScroll contentContainerStyle={styles.content}>
        {() =>
          authState.isLoggedIn ? (
            <AuthIsLogin
              nickname={authState.nickname}
              phone={authState.phone}
              cardColor={cardColor}
              borderColor={borderColor}
              onLogout={handleLogout}
            />
          ) : authMode === 'login' ? (
            <AuthLogin
              loaded={loaded}
              countdown={countdown}
              initialPhone={cachedPhone}
              initialNickname={cachedNickname}
              onSendCode={handleSendCode}
              onSubmit={handleLoginSubmit}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : authMode === 'validation' && pendingValidation ? (
            <AuthValidation
              phone={pendingValidation.phone}
              nickname={pendingValidation.nickname}
              method={pendingValidation.method}
              onCompleteLogin={handleValidationComplete}
              onForgotPassword={() => setAuthMode('forgot')}
            />
          ) : authMode === 'forgot' ? (
            <AuthForgot
              countdown={countdown}
              initialPhone={pendingValidation?.phone || cachedPhone}
              onSendCode={handleSendCode}
              onSubmit={handleForgotSubmit}
            />
          ) : authMode === 'register' ? (
            <AuthRegister
              countdown={countdown}
              onSendCode={handleSendCode}
              onSubmit={handleRegisterSubmit}
            />
          ) : (
            <View />
          )
        }
      </KeyboardAwareScroll>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
