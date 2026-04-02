import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowMermaidRendererProps {
  code: string;
}

export function WorkflowMermaidRenderer({ code }: WorkflowMermaidRendererProps) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({ light: '#F8FAFC', dark: '#161B22' }, 'card');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#30363D' }, 'border');
  const [height, setHeight] = useState(160);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const html = useMemo(() => {
  const safeCode = JSON.stringify(code);
    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: transparent;
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            #container {
              width: 100%;
              min-height: 80px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              padding: 8px 0;
              box-sizing: border-box;
            }
            #diagram {
              width: 100%;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
            .error {
              color: #ef4444;
              white-space: pre-wrap;
              font-size: 13px;
              line-height: 1.5;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div id="container">
            <div id="diagram"></div>
          </div>
          <script>
            const source = ${safeCode};
            const post = (payload) => {
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            };

            const sendHeight = () => {
              const nextHeight = Math.max(
                document.documentElement.scrollHeight || 0,
                document.body.scrollHeight || 0,
                document.getElementById('container')?.scrollHeight || 0,
                80
              );
              post({ type: 'height', value: nextHeight });
            };

            const render = async () => {
              try {
                mermaid.initialize({
                  startOnLoad: false,
                  securityLevel: 'loose',
                  theme: 'default',
                });
                const id = 'mermaid-' + Date.now();
                const result = await mermaid.render(id, source);
                document.getElementById('diagram').innerHTML = result.svg;
                sendHeight();
                post({ type: 'loaded' });
              } catch (error) {
                document.getElementById('diagram').innerHTML = '<div class="error">流程图渲染失败</div>';
                sendHeight();
                post({
                  type: 'error',
                  message: error && error.message ? error.message : 'unknown error'
                });
              }
            };

            window.addEventListener('load', render);
            window.addEventListener('resize', sendHeight);
          </script>
        </body>
      </html>`;
    }, [code]);

  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.errorTitle, { color: textColor }]}>流程图渲染失败</Text>
        <View style={[styles.codeFallback, { borderColor }]}>
          <Text style={[styles.codeText, { color: textColor }]}>{code}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
      {!hasLoaded ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={textColor} />
        </View>
      ) : null}
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={[styles.webview, { height, backgroundColor: 'transparent' }]}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        automaticallyAdjustContentInsets={false}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data);
            if (payload.type === 'height' && typeof payload.value === 'number') {
              setHeight(Math.max(100, Math.ceil(payload.value)));
              return;
            }
            if (payload.type === 'loaded') {
              setHasLoaded(true);
              return;
            }
            if (payload.type === 'error') {
              setHasLoaded(true);
              setHasError(true);
            }
          } catch {
            setHasLoaded(true);
            setHasError(true);
          }
        }}
        onError={() => {
          setHasLoaded(true);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 10,
    minHeight: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  webview: {
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  codeFallback: {
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
