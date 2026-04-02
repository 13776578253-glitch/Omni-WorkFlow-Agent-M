import React from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display'; // 引入 Markdown 渲染器

import { WorkflowMermaidRenderer } from '@/components/workflow/Workflow_Context_bin/Workflow_Mermaid_Renderer';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowMarkdownRendererProps {
  content: string;
  align?: 'left' | 'right';  // 文本对齐方式
}

// 工作流 Markdown 渲染组件 / 支持 Mermaid 图表
type MarkdownSegment =
  | { type: 'markdown'; content: string }
  | { type: 'mermaid'; content: string; raw: string };

// 分别渲染 Markdown 和 Mermaid 内容 / 通过正则表达式解析 Markdown 中的 Mermaid 块
function splitMarkdownWithMermaid(content: string): MarkdownSegment[] {
  const pattern = /```mermaid\s*([\s\S]*?)```/g;
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const [raw, code = ''] = match;
    const prefix = content.slice(lastIndex, match.index);
    if (prefix.trim()) {
      segments.push({ type: 'markdown', content: prefix });
    }

    const normalizedCode = code.trim();
    if (normalizedCode) {
      segments.push({ type: 'mermaid', content: normalizedCode, raw });
    } else {
      segments.push({ type: 'markdown', content: raw });
    }

    lastIndex = match.index + raw.length;
  }

  const suffix = content.slice(lastIndex);
  if (suffix.trim()) {
    segments.push({ type: 'markdown', content: suffix });
  }

  if (segments.length === 0) {
    return [{ type: 'markdown', content }];
  }

  return segments;
}

// 渲染 Markdown 内容
export function WorkflowMarkdownRenderer({ content, align = 'left' }: WorkflowMarkdownRendererProps) {
  const textColor = useThemeColor({}, 'text');
  const codeBgColor = useThemeColor({ light: '#f6f8fa', dark: '#161b22' }, 'background');
  const segments = splitMarkdownWithMermaid(content);
   
  // 自定义 Markdown 样式 / 待修改
  const markdownStyles = StyleSheet.create({
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      textAlign: align,     // 文本对齐方式
    },
    heading1: {
      color: textColor,
      fontSize: 24,
      marginTop: 20,
      marginBottom: 10,
      fontWeight: 'bold',
      textAlign: align,
    },
    heading2: {
      color: textColor,
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      textAlign: align,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 10,
      textAlign: align,
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
      {segments.map((segment, index) => {
        if (segment.type === 'mermaid') {
          return (
            <View key={`mermaid-${index}`} style={styles.mermaidBlock}>
              <WorkflowMermaidRenderer code={segment.content} />
            </View>
          );
        }

        return (
          <Markdown key={`markdown-${index}`} style={markdownStyles}>
            {segment.content}
          </Markdown>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // width: '100%',  // 允许容器根据内容宽度调整
  },
  mermaidBlock: {
    width: '100%',
  },
});
