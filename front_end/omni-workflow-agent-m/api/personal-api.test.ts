import {
  getUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from './personal-api';

function mockFetchJson(payload: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    ),
    status: 200,
  } as unknown as Response);
}

const preferences: UserPreferences = {
  presetMode: 'formal',
  presetPrompts: {
    custom: 'c1',
    concise: 'c2',
    formal: 'c3',
  },
  quickActionNames: {
    solt1: 'n1',
    solt2: 'n2',
    solt3: 'n3',
    solt4: 'n4',
  },
  quickActionPrompts: {
    solt1: 'p1',
    solt2: 'p2',
    solt3: 'p3',
    solt4: 'p4',
  },
  memoryContent: 'remember me',
};

describe('personal-api', () => {
  test('getUserPreferences returns backend data', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: preferences,
    });

    await expect(getUserPreferences('1001')).resolves.toEqual(preferences);
  });

  test('saveUserPreferences sends user id merged with payload', async () => {
    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });

    await expect(saveUserPreferences('1001', preferences)).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/user/preferences',
      expect.objectContaining({
        body: JSON.stringify({
          id: '1001',
          ...preferences,
        }),
      })
    );
  });

  test('throws backend message and parse errors', async () => {
    mockFetchJson({
      code: 'ERR_USER_NOT_FOUND',
      message: 'user not found',
      data: null,
    });
    await expect(getUserPreferences('missing')).rejects.toThrow('user not found');

    mockFetchJson('oops');
    await expect(getUserPreferences('1001')).rejects.toThrow('服务器响应格式错误');
  });
});
