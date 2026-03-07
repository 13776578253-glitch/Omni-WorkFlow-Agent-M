import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SettingItem } from '@/components/user/Setting_Item';
import { SettingSection } from '@/components/user/Setting_section';

interface AuthIsLoginProps {
  nickname: string;
  phone: string;
  cardColor: string;
  borderColor: string;
  onLogout: () => void;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return phone || '-';
  const first = digits.slice(0, 3);
  const last = digits.slice(-2);
  return `+86 ${first}******${last}`;
}

export function AuthIsLogin({
  nickname,
  phone,
  cardColor,
  borderColor,
  onLogout,
}: AuthIsLoginProps) {
  return (
    <>
      <SettingSection title="账户">
        <SettingItem
          // icon="person-circle-outline"
          title="昵称"
          value={nickname || 'CPP test'}
          hasArrow={false}
        />
        <SettingItem
          // icon="call-outline"
          title="手机号"
          value={phone ? maskPhone(phone) : '-'}
          hasArrow={false}
        />
      </SettingSection>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: cardColor, borderColor }]}
        onPress={onLogout}
        activeOpacity={0.75}
      >
        <ThemedText style={styles.logoutText}>退出登录</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ff453a',
    fontWeight: '600',
    fontSize: 16,
  },
});
