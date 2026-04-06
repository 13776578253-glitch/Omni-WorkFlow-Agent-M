jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
  Platform: { OS: 'ios' },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  copyAsync: jest.fn(),
  getContentUriAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  WebBrowserPresentationStyle: { AUTOMATIC: 'automatic' },
  openBrowserAsync: jest.fn(),
}));

import { resolveWorkflowAttachmentOpenUrl } from './Workflow_Attachment_Preview';
import type { WorkflowAttachment } from '@/constants/workflow_type';

describe('Workflow_Attachment_Preview', () => {
  test('uses fileRef url and resolves relative backend urls', () => {
    const remoteAttachment: WorkflowAttachment = {
      id: '1',
      type: 'file',
      fileName: 'report.pdf',
      fileRef: {
        url: 'https://cdn.example.com/report.pdf',
        fileName: 'report.pdf',
      },
    };
    const relativeAttachment: WorkflowAttachment = {
      id: '2',
      type: 'file',
      fileName: 'report.pdf',
      fileRef: {
        url: '/mock/workflow/files/report.pdf',
        fileName: 'report.pdf',
      },
    };

    expect(resolveWorkflowAttachmentOpenUrl(remoteAttachment)).toBe(
      'https://cdn.example.com/report.pdf'
    );
    expect(resolveWorkflowAttachmentOpenUrl(relativeAttachment)).toBe(
      'http://localhost:8000/mock/workflow/files/report.pdf'
    );
  });

  test('falls back to normalized local path and relative fileRef path', () => {
    const localAttachment: WorkflowAttachment = {
      id: '3',
      type: 'file',
      fileName: 'note.txt',
      localPath: '/var/mobile/note.txt',
    };
    const storedAttachment: WorkflowAttachment = {
      id: '4',
      type: 'file',
      fileName: 'report.pdf',
      fileRef: {
        path: '/uploads/report.pdf',
        fileName: 'report.pdf',
      },
    };

    expect(resolveWorkflowAttachmentOpenUrl(localAttachment)).toBe(
      'file:///var/mobile/note.txt'
    );
    expect(resolveWorkflowAttachmentOpenUrl(storedAttachment)).toBe(
      'http://localhost:8000/uploads/report.pdf'
    );
  });

  test('returns null when attachment has no usable target path', () => {
    const emptyAttachment: WorkflowAttachment = {
      id: '5',
      type: 'file',
      fileName: 'empty.txt',
    };

    expect(resolveWorkflowAttachmentOpenUrl(emptyAttachment)).toBeNull();
  });
});
