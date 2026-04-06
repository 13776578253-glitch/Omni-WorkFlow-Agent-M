import {
  generate,
  getLongAudioTaskStatus,
  getSession,
  submitInput,
  submitLongAudioTask,
  transcript,
  uploadAudio,
  uploadFile,
} from './workflow-api';

class MockFormData {
  entries: Array<[string, unknown]> = [];

  append(key: string, value: unknown) {
    this.entries.push([key, value]);
  }
}

function mockFetchJson(payload: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    ),
    status: 200,
  } as unknown as Response);
}

describe('workflow-api', () => {
  beforeEach(() => {
    global.FormData = MockFormData as unknown as typeof FormData;
  });

  test('getSession falls back to requested session id when response omits it', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        blocks: [],
        lastModified: 123,
      },
    });

    await expect(getSession('session-001')).resolves.toEqual({
      sessionId: 'session-001',
      blocks: [],
      lastModified: 123,
    });
  });

  test('submitInput appends compatible session fields', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        userBlockId: 'user-001',
      },
    });

    await expect(
      submitInput({
        sessionId: 'session-001',
        text: 'hello',
        blocks: [],
      })
    ).resolves.toEqual({ userBlockId: 'user-001' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/workflow/input',
      expect.objectContaining({
        body: expect.any(String),
      })
    );
    const submitInputRequest = (global.fetch as jest.Mock).mock.calls[0][1] as { body: string };
    expect(JSON.parse(submitInputRequest.body)).toEqual({
      sessionId: 'session-001',
      id: 'session-001',
      text: 'hello',
      blocks: [],
    });
  });

  test('generate appends compatibility fields for legacy id payloads', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        blockId: 'ai-001',
        content: 'generated',
        sourceBlockId: 'user-001',
        status: 'done',
      },
    });

    await expect(
      generate({
        id: 'session-legacy',
        blocks: [],
        action: 'regenerate_from_first',
      })
    ).resolves.toEqual({
      blockId: 'ai-001',
      content: 'generated',
      sourceBlockId: 'user-001',
      status: 'done',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/workflow/generate',
      expect.objectContaining({
        body: expect.any(String),
      })
    );
    const generateRequest = (global.fetch as jest.Mock).mock.calls[0][1] as { body: string };
    expect(JSON.parse(generateRequest.body)).toEqual({
      id: 'session-legacy',
      sessionId: 'session-legacy',
      blocks: [],
      action: 'regenerate_from_first',
    });
  });

  test('uploadFile includes multipart file and session compatibility fields', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        fileRef: {
          fileName: 'report.pdf',
          mimeType: 'application/pdf',
        },
      },
    });

    await expect(
      uploadFile({
        sessionId: 'session-001',
        file: {
          uri: 'file:///report.pdf',
          name: 'report.pdf',
          type: 'application/pdf',
        },
      })
    ).resolves.toEqual({
      fileRef: {
        fileName: 'report.pdf',
        mimeType: 'application/pdf',
      },
    });

    const request = (global.fetch as jest.Mock).mock.calls[0][1] as { body: MockFormData };
    expect(request.body.entries).toEqual([
      [
        'file',
        {
          uri: 'file:///report.pdf',
          name: 'report.pdf',
          type: 'application/pdf',
        },
      ],
      ['sessionId', 'session-001'],
      ['id', 'session-001'],
    ]);
  });

  test('uploadAudio maps compatibility fields and fallback response keys', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        audioResourceId: 'audio-001',
        url: '/mock/audio-001',
      },
    });

    await expect(
      uploadAudio({
        id: 'session-001',
        durationMs: 1234,
        file: {
          uri: 'file:///meeting.m4a',
          name: 'meeting.m4a',
          type: 'audio/m4a',
        },
      })
    ).resolves.toEqual({
      remoteAudioId: 'audio-001',
      url: '/mock/audio-001',
    });

    const request = (global.fetch as jest.Mock).mock.calls[0][1] as { body: MockFormData };
    expect(request.body.entries).toEqual([
      [
        'file',
        {
          uri: 'file:///meeting.m4a',
          name: 'meeting.m4a',
          type: 'audio/m4a',
        },
      ],
      ['durationMs', '1234'],
      ['sessionId', 'session-001'],
      ['id', 'session-001'],
    ]);
  });

  test('transcript builds fullText from segments when backend omits it', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        segments: [
          { startTime: 0, endTime: 1, text: 'hello ' },
          { startTime: 1, endTime: 2, text: 'world' },
        ],
      },
    });

    await expect(
      transcript({
        sessionId: 'session-001',
        audioResourceId: 'audio-001',
      })
    ).resolves.toEqual({
      segments: [
        { startTime: 0, endTime: 1, text: 'hello ' },
        { startTime: 1, endTime: 2, text: 'world' },
      ],
      fullText: 'hello world',
    });
  });

  test('submitLongAudioTask defaults accepted to true when backend omits it', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        taskId: 'task-001',
        sessionId: 'session-001',
      },
    });

    await expect(
      submitLongAudioTask({
        sessionId: 'session-001',
        audioResourceId: 'audio-001',
        prompt: 'prompt',
      })
    ).resolves.toEqual({
      taskId: 'task-001',
      sessionId: 'session-001',
      accepted: true,
    });
  });

  test('getLongAudioTaskStatus returns status payload', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: {
        taskId: 'task-001',
        status: 'processing',
        sessionId: 'session-001',
      },
    });

    await expect(getLongAudioTaskStatus('task-001')).resolves.toEqual({
      taskId: 'task-001',
      status: 'processing',
      sessionId: 'session-001',
    });
  });

  test('throws backend message and parse error for malformed response', async () => {
    mockFetchJson({
      code: 'ERR_WORKFLOW_SESSION_NOT_FOUND',
      message: 'workflow session not found',
      data: null,
    });
    await expect(getSession('missing')).rejects.toThrow('workflow session not found');

    mockFetchJson('<html>bad gateway</html>');
    await expect(getSession('session-001')).rejects.toThrow('服务器响应格式错误');
  });
});
