import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { AuthForgot } from '@/components/user/auth/forgot';
import { AuthIsLogin } from '@/components/user/auth/islogin';
import { AuthLogin } from '@/components/user/auth/login';
import { AuthRegister } from '@/components/user/auth/register';

import { KeyboardAwareScroll } from '@/components/user/personal/Keyboard_Aware_Scroll';

import { useThemeColor } from '@/hooks/use-theme-color';

// 存储
import AsyncStorage from '@react-native-async-storage/async-storage';
//本地存储 键名
const STORAGE_KEY = '@omni_workflow_user_data_v1';             // 用户数据
const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';        // 用户认证状态
const AUTH_LINK_KEY = '@omni_workflow_user_data_v1_auth_link'; // 用户数据与认证关联

// 认证模式类型
type AuthMode = 'login' | 'register' | 'forgot';

interface AuthState {
  isLoggedIn: boolean;
  nickname: string;
  phone: string;
  updatedAt: number;
}

export default function AuthScreen() {
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000000' }, 'background');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const borderColor = useThemeColor({}, 'border');

  const [authMode, setAuthMode] = useState<AuthMode>('login');  // 默认认证模式 (跳转首页) 登录
  const [countdown, setCountdown] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [cachedPhone, setCachedPhone] = useState('');           // 缓存手机号 / 测试
  const [cachedNickname, setCachedNickname] = useState('');     // 缓存昵称 / 测试
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    nickname: '',
    phone: '',
    updatedAt: Date.now(),
  });

  // 验证码计时器
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  // 认证状态加载
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

  // 认证信息保存
  const saveAuthState = useCallback(async (next: AuthState) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(AUTH_LINK_KEY, STORAGE_KEY);
  }, []);

  // 测试
  const handleSendCode = useCallback(() => {
    if (countdown > 0) return;
    setCountdown(60);
    Alert.alert('验证码', '验证码已发送（模拟）。');
  }, [countdown]);

  const switchToLogin = useCallback(() => {
    setAuthMode('login');
    setCountdown(0);
  }, []);

  const handleLoginSubmit = useCallback(
    async (payload: { variant: 'phone' | 'nickname'; phone: string; nickname: string; code: string }) => {
      const nextState: AuthState = {
        isLoggedIn: true,
        nickname: payload.nickname,
        phone: payload.phone,
        updatedAt: Date.now(),
      };
      try {
        await saveAuthState(nextState);
        setAuthState(nextState);
        setCachedNickname(nextState.nickname);
        setCachedPhone(nextState.phone);
        Alert.alert('登录成功', '欢迎回来。');
      } catch {
        Alert.alert('登录失败', '请稍后重试。');
      }
    },
    [saveAuthState]
  );

  const handleRegisterSubmit = useCallback(
    async (payload: { nickname: string; password: string; phone: string; code: string }) => {
      const nextState: AuthState = {
        isLoggedIn: false,
        nickname: payload.nickname,
        phone: payload.phone,
        updatedAt: Date.now(),
      };
      try {
        await saveAuthState(nextState);
        setCachedNickname(nextState.nickname);
        setCachedPhone(nextState.phone);
        Alert.alert('注册成功', '请使用验证码登录。');
        switchToLogin();
      } catch {
        Alert.alert('注册失败', '请稍后重试。');
      }
    },
    [saveAuthState, switchToLogin]
  );

  const handleLogout = useCallback(async () => {
    const nextState: AuthState = {
      isLoggedIn: false,
      nickname: '',
      phone: '',
      updatedAt: Date.now(),
    };
    try {
      await saveAuthState(nextState);
      setAuthState(nextState);
      setCachedNickname('');
      setCachedPhone('');
      switchToLogin();
      Alert.alert('已退出', '账号已退出登录。');
    } catch {
      Alert.alert('操作失败', '请稍后重试。');
    }
  }, [saveAuthState, switchToLogin]);

  const handleForgotSubmit = useCallback(
    async (_payload: { phone: string; code: string; newPassword: string }) => {
      Alert.alert('修改成功', '请重新登录。');
      switchToLogin();
    },
    [switchToLogin]
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <KeyboardAwareScroll contentContainerStyle={styles.content}>
        {() => (
          authState.isLoggedIn ? (
            <AuthIsLogin
              nickname={authState.nickname}
              phone={authState.phone}
              cardColor={cardColor}
              borderColor={borderColor}
              onLogout={handleLogout}
            />
          ) : (
            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <ThemedText style={styles.title}>
                {authMode === 'login' ? '登录' : authMode === 'register' ? '注册' : '忘记密码'}
              </ThemedText>

              {authMode === 'login' ? (
                <AuthLogin
                  loaded={loaded}
                  countdown={countdown}
                  initialPhone={cachedPhone}
                  initialNickname={cachedNickname}
                  onSendCode={handleSendCode}
                  onSubmit={handleLoginSubmit}
                  onSwitchToRegister={() => setAuthMode('register')}
                  onSwitchToForgot={() => setAuthMode('forgot')}
                />
              ) : null}

              {authMode === 'register' ? (
                <AuthRegister
                  countdown={countdown}
                  onSendCode={handleSendCode}
                  onSubmit={handleRegisterSubmit}
                />
              ) : null}

              {authMode === 'forgot' ? (
                <AuthForgot
                  countdown={countdown}
                  onSendCode={handleSendCode}
                  onSubmit={handleForgotSubmit}
                />
              ) : null}
            </View>
          )
        )}
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
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
});
