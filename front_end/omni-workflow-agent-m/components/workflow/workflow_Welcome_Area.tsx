import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WorkflowWelcomeAreaProps {
  bgColor: string;
  textColor: string;
}

export function WorkflowWelcomeArea({ bgColor, textColor }: WorkflowWelcomeAreaProps) {
  const chipBg = textColor + '14';
  const chipBorder = textColor + '1F';

  return (
    <View style={[styles.welcomeContainer, { backgroundColor: bgColor }]}>
      {/* <View style={styles.headBlock}>
        <Text style={[styles.welcomeLead, { color: textColor + 'C8' }]}>你好</Text>
        <Text style={[styles.welcomeTitle, { color: textColor }]}>今天有什么可以帮你？</Text>
      </View> */}

      {/* <View style={styles.quickList}>
        <View style={[styles.quickChip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
          <Text style={[styles.quickText, { color: textColor + 'D8' }]}>测试</Text>
        </View>
        <View style={[styles.quickChip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
          <Text style={[styles.quickText, { color: textColor + 'D8' }]}>测试</Text>
        </View>
        <View style={[styles.quickChip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
          <Text style={[styles.quickText, { color: textColor + 'D8' }]}>测试</Text>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    paddingTop: 152,
    paddingHorizontal: 24,
  },
  headBlock: {
    alignSelf: 'stretch',
    marginBottom: 28,
  },
  welcomeLead: {
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 5,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 56,
  },
  quickList: {
    alignSelf: 'stretch',
    gap: 12,
  },
  quickChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
