import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SettingItemProps = {
  icon?: keyof typeof Ionicons.glyphMap;  // 图标 /可选
  title: string;
  value?: string | React.ReactNode;       // 右侧值 /支持传入文字或组件 //测试！
  isDestructive?: boolean;                // 是否是危险操作(如退出登录)
  hasArrow?: boolean;                     // 是否显示右侧箭头
  onPress?: () => void;                   // 点击事件
  selected?: boolean;                     // 选中状态事件
};

// 卡片内样式
export function SettingItem({ icon, title, value, isDestructive, hasArrow = true, onPress, selected }: SettingItemProps) {
  // const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = '#519cd9';  // 蓝色
  const isPressable = !!onPress;  // 判断是否可点击
  
  return (
    <TouchableOpacity 
      style={[styles.itemContainer, { borderBottomColor: borderColor }]} 
      onPress={onPress}
      disabled={!isPressable}
      activeOpacity={isPressable ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? '#ff453a' : iconColor}           // 危险操作 红色
          style={styles.itemIcon} 
        />
        <ThemedText style={[
            styles.itemTitle, 
            isDestructive && { color: '#ff453a' },
            selected && { color: tintColor, fontWeight: '600' }      // 选中状态变色 /加粗
        ]}>
          {title}
        </ThemedText>
      </View>
      
      <View style={styles.itemRight}>
        {selected ? (
          <Ionicons name="checkmark" size={20} color={tintColor} />  // 选中状态
        ) : (
          typeof value === 'string' ? <ThemedText style={styles.itemValue}>{value}</ThemedText> : value
        )}
        {/* {value && (
          <ThemedText style={styles.itemValue}>{value}</ThemedText>
        )} */}
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