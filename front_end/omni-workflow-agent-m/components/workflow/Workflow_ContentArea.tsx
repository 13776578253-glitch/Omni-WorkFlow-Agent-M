import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

interface MockMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const BASE_MOCK_DATA: MockMessage[] = [
  { id: '1', role: 'ai', text: 'Hello, I am your workflow assistant.' },
  { id: '2', role: 'user', text: 'Please summarize this meeting note.' },
  { id: '3', role: 'ai', text: 'Sure, send me the source content first.' },
  { id: '4', role: 'user', text: 'Here is the source text... (mock)' },
  { id: '5', role: 'ai', text: 'Received. I will output a structured result.' },
  { id: '6', role: 'ai', text: 'Part 1: Context. Part 2: Conclusion. Part 3: Action items.' },
  { id: '7', role: 'user', text: 'Give me a shorter version too.' },
  { id: '8', role: 'ai', text: 'Short version: progress is on track, review next week.' },
];

const MOCK_DATA: MockMessage[] = Array.from({ length: 8 }).flatMap((_, round) =>
  BASE_MOCK_DATA.map((item) => ({
    ...item,
    id: `${round + 1}-${item.id}`,
  }))
);

export function WorkflowContentArea() {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');

  return (
    <FlatList
      data={MOCK_DATA}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor: bgColor }}
      contentContainerStyle={styles.content}
      scrollEnabled
      nestedScrollEnabled
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      renderItem={({ item }) => {
        const isUser = item.role === 'user';
        return (
          <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: cardColor,
                  borderColor: 'rgba(128,128,128,0.2)',
                },
              ]}
            >
              <Text style={[styles.role, { color: textColor }]}>{isUser ? 'ME' : 'AI'}</Text>
              <Text style={[styles.text, { color: textColor }]}>{item.text}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  row: {
    width: '100%',
    marginBottom: 8,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  role: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
