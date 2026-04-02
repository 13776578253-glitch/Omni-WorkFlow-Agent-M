import { Alert, Linking, Platform } from 'react-native';

import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import type { WorkflowAttachment } from '@/constants/workflow_type';
import { WORKFLOW_API_BASE } from '@/api/workflow-api';

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function isLikelyLocalFilePath(path: string): boolean {
  return /^(file|content):\/\//i.test(path) || path.startsWith('/data/') || path.startsWith('/storage/') || path.startsWith('/sdcard/') || path.startsWith('/var/') || path.startsWith('/private/');
}

function resolveRelativeRemoteUrl(path: string): string {
  try {
    const apiBase = new URL(WORKFLOW_API_BASE);
    return new URL(path, `${apiBase.origin}/`).toString();
  } catch {
    return path;
  }
}

function normalizeLocalUrl(path: string): string {
  if (/^(file|content):\/\//i.test(path)) {
    return path;
  }
  if (path.startsWith('/')) {
    return `file://${path}`;
  }
  return path;
}

function getPreviewCachePath(sourcePath: string): string {
  const fileName = sourcePath.split('/').pop() || `workflow_preview_${Date.now()}`;
  return `${FileSystemLegacy.cacheDirectory}workflow_attachment_preview_${fileName}`;
}

export function resolveWorkflowAttachmentOpenUrl(attachment: WorkflowAttachment): string | null {
  const fileRefUrl = attachment.fileRef?.url?.trim();
  if (fileRefUrl) {
    return isRemoteUrl(fileRefUrl) ? fileRefUrl : resolveRelativeRemoteUrl(fileRefUrl);
  }

  const localPath = attachment.localPath?.trim();
  if (localPath) {
    return normalizeLocalUrl(localPath);
  }

  const fileRefPath = attachment.fileRef?.path?.trim();
  if (fileRefPath) {
    if (!isLikelyLocalFilePath(fileRefPath)) {
      return resolveRelativeRemoteUrl(fileRefPath);
    }
    return normalizeLocalUrl(fileRefPath);
  }

  return null;
}

async function resolveOpenableLocalUrl(targetUrl: string): Promise<string> {
  if (/^content:\/\//i.test(targetUrl)) {
    return targetUrl;
  }

  if (Platform.OS === 'android' && /^file:\/\//i.test(targetUrl)) {
    const sourceFileUri = targetUrl;
    const localPath = targetUrl.replace(/^file:\/\//i, '');
    const previewPath = getPreviewCachePath(localPath);
    await FileSystemLegacy.copyAsync({
      from: sourceFileUri,
      to: previewPath,
    });
    const contentUri = await FileSystemLegacy.getContentUriAsync(previewPath);
    console.log('[workflow-attachment] prepared local preview file', {
      sourceFileUri,
      localPath,
      previewPath,
      contentUri,
    });
    return contentUri;
  }

  return targetUrl;
}

async function resolveShareableLocalFileUri(targetUrl: string): Promise<string> {
  if (/^content:\/\//i.test(targetUrl)) {
    return targetUrl;
  }

  if (Platform.OS === 'android' && /^file:\/\//i.test(targetUrl)) {
    const sourceFileUri = targetUrl;
    const localPath = targetUrl.replace(/^file:\/\//i, '');
    const previewPath = getPreviewCachePath(localPath);
    await FileSystemLegacy.copyAsync({
      from: sourceFileUri,
      to: previewPath,
    });
    console.log('[workflow-attachment] prepared local share file', {
      sourceFileUri,
      localPath,
      previewPath,
    });
    return previewPath;
  }

  return targetUrl;
}

function shouldUseSystemShareForLocalAttachment(attachment: WorkflowAttachment): boolean {
  if (attachment.type === 'image') {
    return false;
  }

  const fileName = attachment.fileName.toLowerCase();
  const mimeType = attachment.mimeType?.toLowerCase() ?? '';

  return (
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx') ||
    mimeType.includes('pdf') ||
    mimeType.includes('powerpoint') ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.startsWith('audio/')
  );
}

export async function openWorkflowAttachmentPreview(attachment: WorkflowAttachment): Promise<void> {
  const targetUrl = resolveWorkflowAttachmentOpenUrl(attachment);
  console.log('[workflow-attachment] preview request', {
    fileName: attachment.fileName,
    type: attachment.type,
    mimeType: attachment.mimeType,
    localPath: attachment.localPath,
    fileRef: attachment.fileRef,
    targetUrl,
  });

  if (!targetUrl) {
    Alert.alert('无法打开附件', '当前附件缺少可用的预览地址。');
    return;
  }

  try {
    if (isRemoteUrl(targetUrl)) {
      console.log('[workflow-attachment] opening remote url', { targetUrl });
      await openBrowserAsync(targetUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
      return;
    }

    if (shouldUseSystemShareForLocalAttachment(attachment)) {
      const shareableUri = await resolveShareableLocalFileUri(targetUrl);
      const isShareAvailable = await Sharing.isAvailableAsync();
      console.log('[workflow-attachment] opening via system share', {
        targetUrl,
        shareableUri,
        mimeType: attachment.mimeType,
        isShareAvailable,
      });

      if (!isShareAvailable) {
        throw new Error('System share is unavailable');
      }

      await Sharing.shareAsync(shareableUri, {
        mimeType: attachment.mimeType,
        dialogTitle: attachment.fileName,
      });
      return;
    }

    const openableUrl = await resolveOpenableLocalUrl(targetUrl);
    console.log('[workflow-attachment] opening local url', { targetUrl, openableUrl });

    const supported = await Linking.canOpenURL(openableUrl);
    if (!supported) {
      throw new Error(`Unsupported attachment url: ${openableUrl}`);
    }

    await Linking.openURL(openableUrl);
  } catch (error) {
    console.log('[workflow-attachment] open failed', {
      fileName: attachment.fileName,
      targetUrl,
      error,
    });
    Alert.alert('打开失败', '暂时无法预览这个附件，请稍后重试。');
  }
}
