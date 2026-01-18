import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;          // 右侧值
  isDestructive?: boolean; // 是否是危险操作(如退出登录)
  hasArrow?: boolean;      // 是否显示右侧箭头
  onPress?: () => void;    // 点击事件
};

export function SettingItem({ icon, title, value, isDestructive, hasArrow = true, onPress }: SettingItemProps) {
  // const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <TouchableOpacity 
      style={[styles.itemContainer, { borderBottomColor: borderColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? '#ff453a' : iconColor} 
          style={styles.itemIcon} 
        />
        <ThemedText style={[styles.itemTitle, isDestructive && { color: '#ff453a' }]}>
          {title}
        </ThemedText>
      </View>
      
      <View style={styles.itemRight}>
        {value && (
          <ThemedText style={styles.itemValue}>{value}</ThemedText>
        )}
        {hasArrow && (
          <Ionicons name="chevron-forward" size={20} color={useThemeColor({}, 'icon')} style={{ opacity: 0.5 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,  // 极细分割线
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 15,
    opacity: 0.6,
    marginRight: 8,
  },
});