import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ForgotStep = 'verify' | 'reset';

interface ForgotSubmitPayload {
  phone: string;
  code: string;
  newPassword: string;
}

interface AuthForgotProps {
  countdown: number;
  onSendCode: () => void;
  onSubmit: (payload: ForgotSubmitPayload) => void;
}

export function AuthForgot({ countdown, onSendCode, onSubmit }: AuthForgotProps) {
  const textColor = useThemeColor({}, 'text');
  const linkColor = useThemeColor({ light: '#2563EB', dark: '#60A5FA' }, 'tint');
  const inputBgColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const inputBorderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');

  const [step, setStep] = useState<ForgotStep>('verify');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const canSendCode = countdown <= 0 && phone.trim().length > 0;

  const handleVerify = () => {
    if (!phone.trim() || !code.trim()) {
      Alert.alert('提示', '请先填写手机号和验证码。');
      return;
    }
    setStep('reset');
  };

  const handleReset = () => {
    if (!newPassword.trim()) {
      Alert.alert('提示', '请输入新密码。');
      return;
    }
    onSubmit({
      phone: phone.trim(),
      code: code.trim(),
      newPassword: newPassword.trim(),
    });
    setStep('verify');
    setPhone('');
    setCode('');
    setNewPassword('');
  };

  return step === 'verify' ? (
    <>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="输入手机号"
        placeholderTextColor={textColor + '66'}
        style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
        keyboardType="phone-pad"
      />
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
      <TouchableOpacity onPress={handleVerify} style={[styles.primaryButton, { backgroundColor: linkColor }]}>
        <ThemedText style={styles.primaryButtonText}>验证</ThemedText>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="输入新密码"
        placeholderTextColor={textColor + '66'}
        style={[styles.input, { color: textColor, backgroundColor: inputBgColor, borderColor: inputBorderColor }]}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleReset} style={[styles.primaryButton, { backgroundColor: linkColor }]}>
        <ThemedText style={styles.primaryButtonText}>重置密码</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
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
