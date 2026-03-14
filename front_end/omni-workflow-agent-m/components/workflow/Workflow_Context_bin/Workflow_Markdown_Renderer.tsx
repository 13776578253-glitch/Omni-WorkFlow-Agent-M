import React from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowMarkdownRendererProps {
  content: string;
}

export function WorkflowMarkdownRenderer({ content }: WorkflowMarkdownRendererProps) {
  const textColor = useThemeColor({}, 'text');
  const codeBgColor = useThemeColor({ light: '#f6f8fa', dark: '#161b22' }, 'background');
  
  // Custom markdown styles based on theme
  const markdownStyles = StyleSheet.create({
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: textColor,
      fontSize: 24,
      marginTop: 20,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    heading2: {
      color: textColor,
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 10,
    },
    list_item: {
      marginTop: 4,
      marginBottom: 4,
    },
    code_inline: {
      backgroundColor: codeBgColor,
      color: textColor,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: codeBgColor,
      color: textColor,
      borderColor: 'transparent',
    },
    blockquote: {
      backgroundColor: codeBgColor,
      borderLeftColor: textColor,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.container}>
      <Markdown style={markdownStyles}>
        {content}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
