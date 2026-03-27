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
import * as authApi from '@/api/auth-api';

const STORAGE_KEY = '@omni_workflow_user_data_v1';
const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';
const AUTH_LINK_KEY = '@omni_workflow_user_data_v1_auth_link';

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
    try {
      const result = await authApi.sendCode(phone);
      setCountdown(60);
      Alert.alert('验证码已发送', `验证码：${result.requestId}\n\n请查收手机 ${phone} 的短信`);
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '请稍后重试。');
    }
  }, [countdown]);

  const switchToLogin = useCallback(() => {
    setAuthMode('login');
    setCountdown(0);
    setPendingValidation(null);
  }, []);

  const handleLoginSubmit = useCallback(
    async (payload: { variant: 'phone'; phone: string; nickname: string; code: string; method: 'code' | 'password' }) => {
      setPendingValidation({
        phone: payload.phone,
        method: payload.method,
        nickname: payload.nickname,
      });
      setAuthMode('validation');
    },
    []
  );

  const handleValidationComplete = useCallback(
    async (payload: { phone: string; nickname: string; password?: string }) => {
      try {
        const result = pendingValidation?.method === 'code'
          ? await authApi.loginWithCode(payload.phone)
          : await authApi.loginWithPassword(payload.phone, payload.password || '');

        const nextState: AuthState = {
          isLoggedIn: true,
          nickname: result.user.name,
          phone: payload.phone,
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
        await authApi.register(payload.nickname, payload.password, payload.phone, payload.code);
        const nextState: AuthState = {
          isLoggedIn: false,
          nickname: payload.nickname,
          phone: payload.phone,
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
      await authApi.logout();
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
        await authApi.resetPassword(payload.phone, payload.code, payload.newPassword);
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
