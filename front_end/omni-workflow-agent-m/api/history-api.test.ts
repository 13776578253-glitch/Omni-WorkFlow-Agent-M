import {
  createSession,
  deleteSession,
  getSessions,
  renameSession,
  togglePinSession,
} from './history-api';

function mockFetchJson(payload: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    ),
    status: 200,
  } as unknown as Response);
}

describe('history-api', () => {
  test('getSessions returns session list', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        sessions: [
          {
            id: 'session-001',
            title: '测试会话',
            createdAt: 1,
            isPinned: false,
            previewText: 'preview',
          },
        ],
      },
    });

    await expect(getSessions('1001')).resolves.toEqual([
      {
        id: 'session-001',
        title: '测试会话',
        createdAt: 1,
        isPinned: false,
        previewText: 'preview',
      },
    ]);
  });

  test('createSession returns created session', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        session: {
          id: 'session-002',
          title: '新的历史会话',
          createdAt: 2,
          isPinned: false,
          previewText: '新的预览文本',
        },
      },
    });

    await expect(createSession('1001', '新的历史会话', '新的预览文本')).resolves.toEqual({
      id: 'session-002',
      title: '新的历史会话',
      createdAt: 2,
      isPinned: false,
      previewText: '新的预览文本',
    });
  });

  test('mutating operations resolve when backend responds with code 0', async () => {
    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });
    await expect(renameSession('1001', 'session-001', '重命名后')).resolves.toBeUndefined();

    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });
    await expect(togglePinSession('1001', 'session-001', true)).resolves.toBeUndefined();

    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });
    await expect(deleteSession('1001', 'session-001')).resolves.toBeUndefined();
  });

  test('throws backend message on business failure', async () => {
    mockFetchJson({
      code: 'ERR_HISTORY_SESSION_NOT_FOUND',
      message: 'history session not found',
      data: null,
    });

    await expect(deleteSession('1001', 'missing')).rejects.toThrow('history session not found');
  });

  test('throws parse error on malformed response body', async () => {
    mockFetchJson('not-json');

    await expect(getSessions('1001')).rejects.toThrow('服务器响应格式错误');
  });
});
