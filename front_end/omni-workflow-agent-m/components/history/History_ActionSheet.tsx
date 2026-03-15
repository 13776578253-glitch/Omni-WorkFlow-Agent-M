import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { HistorySession } from '@/services/history/History_Storage';

interface HistoryActionSheetProps {
  session: HistorySession | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (session: HistorySession) => void;
  onRename: (session: HistorySession) => void;
  onTogglePin: (session: HistorySession) => void;
}

interface ActionRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}

function ActionRow({ icon, label, color, onPress }: ActionRowProps) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={color} style={styles.actionIcon} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function History_ActionSheet({
  session,
  visible,
  onClose,
  onDelete,
  onRename,
  onTogglePin,
}: HistoryActionSheetProps) {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  if (!session) return null;

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const separatorColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(200)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: cardBg }]}
      >
        {/* Title preview */}
        <View style={[styles.titleRow, { borderBottomColor: separatorColor }]}>
          <Text style={[styles.sheetTitle, { color: themeColors.text }]} numberOfLines={1}>
            {session.title}
          </Text>
        </View>

        <ActionRow
          icon="trash-outline"
          label="删除"
          color="#FF3B30"
          onPress={() => { onDelete(session); onClose(); }}
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />

        <ActionRow
          icon="pencil-outline"
          label="重命名"
          color={themeColors.text}
          onPress={() => { onRename(session); onClose(); }}
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />

        <ActionRow
          icon={session.isPinned ? 'pin' : 'pin-outline'}
          label={session.isPinned ? '取消置顶' : '置顶'}
          color={themeColors.text}
          onPress={() => { onTogglePin(session); onClose(); }}
        />

        {/* Safe area spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  titleRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 14,
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionIcon: {
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  actionLabel: {
    fontSize: 17,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  bottomSpacer: {
    height: 34,
  },
});
