import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WorkflowLongRecordingOverlayProps {
  visible: boolean;
  durationSeconds: number;
  dots: { key: string; height: number; opacity: number }[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function WorkflowLongRecordingOverlay({
  visible,
  durationSeconds,
  dots,
  onCancel,
  onConfirm,
}: WorkflowLongRecordingOverlayProps) {
  const bgColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  if (!visible) return null;

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.timer, { color: textColor }]}>{timeText}</Text>

      <View style={styles.waveformContainer}>
        {dots.map((dot) => (
          <View
            key={dot.key}
            style={[
              styles.dot,
              {
                height: Math.max(4, dot.height),
                opacity: dot.opacity,
                backgroundColor: '#3B82F6',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Ionicons name="checkmark" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    fontSize: 32,
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 40,
  },
  dot: {
    width: 3,
    borderRadius: 1.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  cancelButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
