import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type LoginVariant = 'phone' | 'nickname';

interface LoginSubmitPayload {
  variant: LoginVariant;
  phone: string;
  nickname: string;
  code: string;
}

interface AuthLoginProps {
  loaded: boolean;
  countdown: number;
  initialPhone?: string;
  initialNickname?: string;
  onSendCode: () => void;
  onSubmit: (payload: LoginSubmitPayload) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export function AuthLogin({
  loaded,
  countdown,
  initialPhone = '',
  initialNickname = '',
  onSendCode,
  onSubmit,
  onSwitchToRegister,
  onSwitchToForgot,
}: AuthLoginProps) {
  const textColor = useThemeColor({}, 'text');
  const linkColor = useThemeColor({ light: '#2563EB', dark: '#60A5FA' }, 'tint');
  const inputBgColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const inputBorderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');

  const [variant, setVariant] = useState<LoginVariant>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [nickname, setNickname] = useState(initialNickname);
  const [code, setCode] = useState('');

  const canSendCode =
    countdown <= 0 && (variant === 'phone' ? phone.trim().length > 0 : nickname.trim().length > 0);

  const handleLogin = () => {
    if (code.trim().length === 0) {
      Alert.alert('提示', '请输入验证码。');
      return;
    }
    if (variant === 'phone' && phone.trim().length === 0) {
      Alert.alert('提示', '请输入手机号。');
      return;
    }
    if (variant === 'nickname' && nickname.trim().length === 0) {
      Alert.alert('提示', '请输入昵称。');
      return;
    }
    onSubmit({
      variant,
      phone: phone.trim(),
      nickname: nickname.trim(),
      code: code.trim(),
    });
  };

  return (
    <>
      <View style={[styles.segmentRow, { borderColor: inputBorderColor }]}>
        <TouchableOpacity
          onPress={() => setVariant('phone')}
          style={[styles.segment, variant === 'phone' ? { backgroundColor: linkColor + '22' } : null]}
        >
          <ThemedText style={styles.segmentText}>手机号登录</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setVariant('nickname')}
          style={[styles.segment, variant === 'nickname' ? { backgroundColor: linkColor + '22' } : null]}
        >
          <ThemedText style={styles.segmentText}>昵称登录</ThemedText>
        </TouchableOpacity>
      </View>

      {variant === 'phone' ? (
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="输入手机号"
          placeholderTextColor={textColor + '66'}
          style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
          keyboardType="phone-pad"
        />
      ) : (
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="输入昵称"
          placeholderTextColor={textColor + '66'}
          style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
        />
      )}

      <View style={styles.codeRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="输入验证码"
          placeholderTextColor={textColor + '66'}
          style={[styles.codeInput, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          disabled={!canSendCode}
          onPress={onSendCode}
          style={[styles.codeButton, { backgroundColor: canSendCode ? linkColor : linkColor + '66' }]}
        >
          <ThemedText style={styles.codeButtonText}>{countdown > 0 ? `${countdown}s` : '获取验证码'}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={onSwitchToRegister}>
          <ThemedText style={[styles.linkText, { color: linkColor }]}>未注册</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSwitchToForgot}>
          <ThemedText style={[styles.linkText, { color: linkColor }]}>忘记密码</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        disabled={!loaded}
        onPress={handleLogin}
        style={[styles.primaryButton, { backgroundColor: linkColor, opacity: loaded ? 1 : 0.5 }]}
      >
        <ThemedText style={styles.primaryButtonText}>登录</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  codeButton: {
    minWidth: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  codeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
