import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AuthValidationProps {
  phone: string;
  nickname: string;
  method: 'code' | 'password';
  onCompleteLogin: (payload: { phone: string; nickname: string }) => void | Promise<void>;
  onForgotPassword: () => void;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return phone;
  return `+86 ${digits.slice(0, 3)}******${digits.slice(-2)}`;
}

export function AuthValidation({
  phone,
  nickname,
  method,
  onCompleteLogin,
  onForgotPassword,
}: AuthValidationProps) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const borderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');
  const captionColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
  const linkColor = useThemeColor({ light: '#0a7ea4', dark: '#0a7ea4' }, 'tint');
  const actionTextColor = useThemeColor({ light: '#0a7ea4', dark: '#FFFFFF' }, 'tint');

  const [countdown, setCountdown] = useState(60);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (method !== 'code') return;
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, method]);

  const completeLogin = async () => {
    await onCompleteLogin({ phone, nickname });
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('提示', '请输入 6 位验证码。');
      return;
    }
    await completeLogin();
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      Alert.alert('提示', '请输入密码。');
      return;
    }
    await completeLogin();
  };

  return method === 'code' ? (
    <>
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.title, { color: textColor }]}>输入 6 位验证码</ThemedText>
        <ThemedText style={[styles.subtitle, { color: captionColor }]}>
          短信验证码已发至 {maskPhone(phone)}
        </ThemedText>
      </View>

      <TouchableOpacity activeOpacity={1} onPress={() => hiddenInputRef.current?.focus()}>
        <View style={styles.codeBoxesRow}>
          {Array.from({ length: 6 }).map((_, idx) => {
            const char = code[idx] ?? '';
            return (
              <View
                key={`code-cell-${idx}`}
                style={[
                  styles.codeCell,
                  {
                    borderColor: idx === code.length ? linkColor : borderColor,
                    backgroundColor: cardColor,
                  },
                ]}
              >
                <ThemedText style={[styles.codeCellText, { color: textColor }]}>{char}</ThemedText>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={hiddenInputRef}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
        />
      </TouchableOpacity>

      <ThemedText style={[styles.resendText, { color: captionColor }]}>
        {countdown > 0 ? `${countdown}s 后重新发送` : '可重新发送'}
      </ThemedText>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: cardColor }]}
        onPress={handleVerifyCode}
        activeOpacity={0.8}
      >
        <ThemedText style={[styles.primaryButtonText, { color: actionTextColor }]}>验证并登录</ThemedText>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.title, { color: textColor }]}>输入登录密码</ThemedText>
        <ThemedText style={[styles.subtitle, { color: captionColor }]}>
          手机号 {maskPhone(phone)}
        </ThemedText>
      </View>

      <View style={[styles.passwordInputWrap, { backgroundColor: cardColor, borderColor }]}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          placeholderTextColor={captionColor}
          style={[styles.passwordInput, { color: textColor }]}
          secureTextEntry
        />
      </View>

      <View style={styles.passwordLinkRow}>
        <View />
        <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.75}>
          <ThemedText style={[styles.passwordLink, { color: linkColor }]}>忘记密码</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: cardColor }]}
        onPress={handleVerifyPassword}
        activeOpacity={0.8}
      >
        <ThemedText style={[styles.primaryButtonText, { color: actionTextColor }]}>验证并登录</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginTop: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  codeBoxesRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  codeCell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeCellText: {
    fontSize: 22,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendText: {
    marginTop: 14,
    fontSize: 13,
    alignSelf: 'center',
  },
  passwordInputWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    justifyContent: 'center',
  },
  passwordInput: {
    fontSize: 15,
  },
  passwordLinkRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passwordLink: {
    fontSize: 13,
  },
  primaryButton: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 18,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
