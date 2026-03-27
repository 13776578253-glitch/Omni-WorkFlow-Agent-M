import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LoginSubmitPayload {
  variant: 'phone';
  phone: string;
  nickname: string;
  code: string;
  method: 'code' | 'password';
}

interface AuthLoginProps {
  loaded: boolean;
  countdown: number;
  initialPhone?: string;
  initialNickname?: string;
  onSendCode: (phone: string) => void;
  onSubmit: (payload: LoginSubmitPayload) => void;
  onSwitchToRegister: () => void;
}

export function AuthLogin({
  loaded,
  initialPhone = '',
  initialNickname = '',
  onSubmit,
  onSwitchToRegister,
}: AuthLoginProps) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const borderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');
  const captionColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
  const actionTextColor = useThemeColor({ light: '#2563EB', dark: '#FFFFFF' }, 'tint');
  const actionBorderColor = useThemeColor({ light: '#2563EB', dark: '#FFFFFF' }, 'border');

  const [phone, setPhone] = useState(initialPhone);
  const [nickname] = useState(initialNickname);
  const [method, setMethod] = useState<'code' | 'password'>('code');

  const canLogin = loaded && phone.trim().length > 0;

  const handleSwitchPassword = () => {
    setMethod('password');
    setPhone('');
  };

  const handleLogin = () => {
    if (phone.trim().length === 0) {
      Alert.alert('提示', '请输入手机号。');
      return;
    }
    onSubmit({
      variant: 'phone',
      phone: phone.trim(),
      nickname: nickname.trim(),
      code: '000000',
      method,
    });
  };

  return (
    <>
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {method === 'password' ? '密码登录' : '手机号登录'}
        </ThemedText>
      </View>

      <View style={[styles.phoneInputWrap, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.countryCodeWrap}>
          <ThemedText style={[styles.countryCodeText, { color: textColor }]}>+86</ThemedText>
          <Ionicons name="chevron-down" size={18} color={captionColor} />
        </View>
        <View style={[styles.verticalDivider, { backgroundColor: borderColor }]} />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="请输入手机号"
          placeholderTextColor={captionColor}
          style={[styles.phoneInput, { color: textColor }]}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={onSwitchToRegister} activeOpacity={0.75}>
          <ThemedText style={[styles.linkText, { color: actionTextColor }]}>未注册？点击注册</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSwitchPassword} activeOpacity={0.75}>
          <ThemedText style={[styles.linkText, { color: actionTextColor }]}>密码登录</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        disabled={!canLogin}
        onPress={handleLogin}
        activeOpacity={0.8}
        style={[
          styles.primaryButton,
          {
            backgroundColor: cardColor,
            // borderColor: actionBorderColor,
            opacity: 1,
          },
        ]}
      >
        <ThemedText style={[styles.primaryButtonText, { color: actionTextColor }]}>验证并登录</ThemedText>
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
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
  },
  countryCodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginRight: 12,
    opacity: 0.6,
  },
  phoneInput: {
    flex: 1,
    textAlign: 'left',
    fontSize: 15,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  linkRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 13,
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
    fontWeight: '700',
    fontSize: 16,
  },
});
