import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';

import type { WorkflowAttachment } from '@/constants/workflow_type';
import {
  openWorkflowAttachmentPreview,
  resolveWorkflowAttachmentOpenUrl,
} from '@/services/workflow/Workflow_Attachment_Preview';

interface WorkflowMessageAttachmentsProps {
  attachments?: WorkflowAttachment[];
}

function getAttachmentPreviewUri(attachment: WorkflowAttachment): string | null {
  return attachment.thumbnailUri || attachment.fileRef?.url || attachment.localPath || null;
}

function isPdfAttachment(attachment: WorkflowAttachment): boolean {
  const fileName = attachment.fileName.toLowerCase();
  const mimeType = attachment.mimeType?.toLowerCase() ?? '';
  return fileName.endsWith('.pdf') || mimeType.includes('pdf');
}

function isRemotePdfUrl(url: string | null): boolean {
  return !!url && /^https?:\/\//i.test(url);
}

function buildPdfViewerUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function WorkflowMessageAttachments({ attachments = [] }: WorkflowMessageAttachmentsProps) {
  const [previewingAttachmentId, setPreviewingAttachmentId] = useState<string | null>(null);
  const [previewingPdfAttachmentId, setPreviewingPdfAttachmentId] = useState<string | null>(null);
  const [pdfPreviewFailed, setPdfPreviewFailed] = useState(false);

  const previewingAttachment = useMemo(
    () => attachments.find((attachment) => attachment.id === previewingAttachmentId) ?? null,
    [attachments, previewingAttachmentId]
  );
  const previewingPdfAttachment = useMemo(
    () => attachments.find((attachment) => attachment.id === previewingPdfAttachmentId) ?? null,
    [attachments, previewingPdfAttachmentId]
  );

  const previewingImageUri = previewingAttachment ? getAttachmentPreviewUri(previewingAttachment) : null;
  const previewingPdfUrl = previewingPdfAttachment
    ? resolveWorkflowAttachmentOpenUrl(previewingPdfAttachment)
    : null;
  const pdfViewerUrl = previewingPdfUrl ? buildPdfViewerUrl(previewingPdfUrl) : null;

  const handleOpenAttachment = useCallback((attachment: WorkflowAttachment) => {
    const previewUri = getAttachmentPreviewUri(attachment);
    if (attachment.type === 'image' && previewUri) {
      setPreviewingAttachmentId(attachment.id);
      return;
    }

    if (isPdfAttachment(attachment)) {
      const pdfUrl = resolveWorkflowAttachmentOpenUrl(attachment);
      if (isRemotePdfUrl(pdfUrl)) {
        setPdfPreviewFailed(false);
        setPreviewingPdfAttachmentId(attachment.id);
        return;
      }

      void openWorkflowAttachmentPreview(attachment);
      return;
    }

    void openWorkflowAttachmentPreview(attachment);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewingAttachmentId(null);
  }, []);

  const handleClosePdfPreview = useCallback(() => {
    setPreviewingPdfAttachmentId(null);
    setPdfPreviewFailed(false);
  }, []);

  const handleOpenPdfExternally = useCallback(() => {
    if (!previewingPdfAttachment) {
      return;
    }
    void openWorkflowAttachmentPreview(previewingPdfAttachment);
  }, [previewingPdfAttachment]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment) => {
          const previewUri = getAttachmentPreviewUri(attachment);
          const isImage = attachment.type === 'image' && !!previewUri;

          return (
            <TouchableOpacity
              key={attachment.id}
              activeOpacity={0.82}
              onPress={() => handleOpenAttachment(attachment)}
              style={[styles.attachmentItem, isImage ? styles.imageAttachmentItem : styles.fileAttachmentItem]}>
              {isImage ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.attachmentThumbnail}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.fileCard}>
                  <Ionicons name="document-outline" size={28} color="#666666" />
                  <Text style={styles.fileName} numberOfLines={2}>
                    {attachment.fileName}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={!!previewingAttachment && !!previewingImageUri}
        transparent
        animationType="fade"
        onRequestClose={handleClosePreview}>
        <Pressable style={styles.previewBackdrop} onPress={handleClosePreview}>
          <View style={styles.previewCard}>
            {previewingImageUri ? (
              <Image
                source={{ uri: previewingImageUri }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : null}
            {previewingAttachment ? (
              <Text style={styles.previewFileName} numberOfLines={1}>
                {previewingAttachment.fileName}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={!!previewingPdfAttachment && !!pdfViewerUrl}
        animationType="slide"
        onRequestClose={handleClosePdfPreview}>
        <View style={styles.pdfModal}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity onPress={handleClosePdfPreview} activeOpacity={0.8} style={styles.pdfHeaderButton}>
              <Ionicons name="close" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.pdfHeaderTitle} numberOfLines={1}>
              {previewingPdfAttachment?.fileName ?? 'PDF 预览'}
            </Text>
            <TouchableOpacity onPress={handleOpenPdfExternally} activeOpacity={0.8} style={styles.pdfHeaderButton}>
              <Ionicons name="open-outline" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {pdfViewerUrl && !pdfPreviewFailed ? (
            <WebView
              source={{ uri: pdfViewerUrl }}
              style={styles.pdfWebView}
              startInLoadingState
              onError={() => setPdfPreviewFailed(true)}
              onHttpError={() => setPdfPreviewFailed(true)}
            />
          ) : (
            <View style={styles.pdfFallback}>
              <Text style={styles.pdfFallbackText}>当前 PDF 无法内置预览，可尝试外部打开。</Text>
              <TouchableOpacity
                onPress={handleOpenPdfExternally}
                activeOpacity={0.85}
                style={styles.pdfFallbackButton}>
                <Text style={styles.pdfFallbackButtonText}>外部打开</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  attachmentItem: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  imageAttachmentItem: {
    width: 80,
    height: 80,
  },
  fileAttachmentItem: {
    minWidth: 96,
    maxWidth: 140,
    minHeight: 80,
  },
  attachmentThumbnail: {
    width: '100%',
    height: '100%',
  },
  fileCard: {
    minHeight: 80,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fileName: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  previewImage: {
    width: '100%',
    height: 360,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewFileName: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  pdfModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pdfHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  pdfHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfHeaderTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    color: '#111111',
    fontWeight: '600',
    textAlign: 'center',
  },
  pdfWebView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pdfFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  pdfFallbackText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  pdfFallbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#111111',
  },
  pdfFallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
