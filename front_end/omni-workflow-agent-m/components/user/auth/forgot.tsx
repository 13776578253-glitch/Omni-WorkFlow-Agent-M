import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ForgotStep = 'phone' | 'code' | 'password';

interface ForgotSubmitPayload {
  phone: string;
  code: string;
  newPassword: string;
}

interface AuthForgotProps {
  countdown: number;
  initialPhone?: string;
  onSendCode: (phone: string) => void;
  onSubmit: (payload: ForgotSubmitPayload) => void;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return phone;
  return `+86 ${digits.slice(0, 3)}******${digits.slice(-2)}`;
}

export function AuthForgot({ countdown, initialPhone = '', onSendCode, onSubmit }: AuthForgotProps) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const borderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'border');
  const captionColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
  const linkColor = useThemeColor({ light: '#2563EB', dark: '#1D4ED8' }, 'tint');

  const [step, setStep] = useState<ForgotStep>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  const handlePhoneNext = () => {
    if (!phone.trim()) {
      Alert.alert('提示', '请输入手机号。');
      return;
    }
    if (countdown <= 0) onSendCode(phone.trim());
    setStep('code');
  };

  const handleCodeNext = () => {
    if (code.length !== 6) {
      Alert.alert('提示', '请输入 6 位验证码。');
      return;
    }
    setStep('password');
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      Alert.alert('提示', '请输入登录密码。');
      return;
    }
    onSubmit({
      phone: phone.trim(),
      code,
      newPassword: password.trim(),
    });
    setStep('phone');
    setCode('');
    setPassword('');
  };

  return (
    <>
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {step === 'phone' ? '忘记密码' : step === 'code' ? '输入 6 位验证码' : '输入登录密码'}
        </ThemedText>
        {step === 'code' ? (
          <ThemedText style={[styles.subtitle, { color: captionColor }]}>
            短信验证码已发至 {maskPhone(phone)}
          </ThemedText>
        ) : null}
      </View>

      {step === 'phone' ? (
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
      ) : null}

      {step === 'code' ? (
        <>
          <TouchableOpacity activeOpacity={1} onPress={() => hiddenInputRef.current?.focus()}>
            <View style={styles.codeBoxesRow}>
              {Array.from({ length: 6 }).map((_, idx) => {
                const char = code[idx] ?? '';
                return (
                  <View
                    key={`forgot-code-cell-${idx}`}
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
          <TouchableOpacity
            onPress={countdown <= 0 ? () => onSendCode(phone.trim()) : undefined}
            activeOpacity={0.75}
            style={styles.resendWrap}
          >
            <ThemedText style={[styles.resendText, { color: captionColor }]}>
              {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送验证码'}
            </ThemedText>
          </TouchableOpacity>
        </>
      ) : null}

      {step === 'password' ? (
        <View style={[styles.passwordInputWrap, { backgroundColor: cardColor, borderColor }]}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="请输入新密码"
            placeholderTextColor={captionColor}
            style={[styles.passwordInput, { color: textColor }]}
            secureTextEntry
          />
        </View>
      ) : null}

      <TouchableOpacity
        onPress={step === 'phone' ? handlePhoneNext : step === 'code' ? handleCodeNext : handlePasswordSubmit}
        activeOpacity={0.8}
        style={[styles.primaryButton, { backgroundColor: cardColor }]}
      >
        <ThemedText style={[styles.primaryButtonText, { color: linkColor }]}>验证并登录</ThemedText>
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
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
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
  resendWrap: {
    marginTop: 10,
    alignSelf: 'center',
  },
  resendText: {
    fontSize: 13,
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
  primaryButton: {
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
