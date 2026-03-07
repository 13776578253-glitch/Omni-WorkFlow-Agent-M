import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface RegisterSubmitPayload {
  nickname: string;
  password: string;
  phone: string;
  code: string;
}

interface AuthRegisterProps {
  countdown: number;
  onSendCode: () => void;
  onSubmit: (payload: RegisterSubmitPayload) => void;
}

export function AuthRegister({ countdown, onSendCode, onSubmit }: AuthRegisterProps) {
  const textColor = useThemeColor({}, 'text');
  const linkColor = useThemeColor({ light: '#2563EB', dark: '#1D4ED8' }, 'tint');
  const inputBgColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const inputBorderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');
  const captionColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
  const codeTextColor = useThemeColor({ light: '#4b7be2', dark: '#FFFFFF' }, 'text');
  const actionTextColor = useThemeColor({ light: '#2563EB', dark: '#FFFFFF' }, 'tint');
  const actionBorderColor = useThemeColor({ light: '#2563EB', dark: '#FFFFFF' }, 'border');

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const canSendCode = countdown <= 0 && phone.trim().length > 0;

  const handleRegister = () => {
    if (!nickname.trim() || !password.trim() || !phone.trim() || !code.trim()) {
      Alert.alert('提示', '请完整填写注册信息。');
      return;
    }
    onSubmit({
      nickname: nickname.trim(),
      password: password.trim(),
      phone: phone.trim(),
      code: code.trim(),
    });
  };

  return (
    <>
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.title, { color: textColor }]}>注册</ThemedText>
      </View>

      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder="输入昵称"
        placeholderTextColor={captionColor}
        style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="输入密码"
        placeholderTextColor={captionColor}
        style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
        secureTextEntry
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="输入手机号"
        placeholderTextColor={captionColor}
        style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
        keyboardType="phone-pad"
      />

      <View style={styles.codeRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="输入验证码"
          placeholderTextColor={captionColor}
          style={[styles.codeInput, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          disabled={!canSendCode}
          onPress={onSendCode}
          style={[styles.codeButton, { backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.codeButtonText, { color: codeTextColor }]}>
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        style={[styles.primaryButton, { backgroundColor: inputBgColor, borderColor: actionBorderColor }]}
        activeOpacity={0.8}
      > 
        
        <ThemedText style={[styles.primaryButtonText, { color: actionTextColor }]}>注册</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    fontSize: 15,
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    fontSize: 15,
  },
  codeButton: {
    minWidth: 108,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: 44,
  },
  codeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    // borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
