import {
  loginWithCode,
  loginWithPassword,
  logout,
  register,
  resetPassword,
  sendCode,
} from './auth-api';

type MockResponseInit = {
  code: string;
  message: string;
  data?: unknown;
  details?: unknown;
};

function mockFetchJson(payload: MockResponseInit | string): void {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    ),
    status: 200,
  } as unknown as Response);
}

describe('auth-api', () => {
  test('sendCode parses successful response', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: { requestId: 'mock-code-001' },
    });

    await expect(sendCode('13800000000')).resolves.toEqual({
      requestId: 'mock-code-001',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/code/send',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('login methods parse returned user payload', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: { user: { id: '1001', name: 'Mock User' } },
    });
    await expect(loginWithCode('13800000000')).resolves.toEqual({
      user: { id: '1001', name: 'Mock User' },
    });

    mockFetchJson({
      code: '0',
      message: 'ok',
      data: { user: { id: '1001', name: 'Mock User' } },
    });
    await expect(loginWithPassword('13800000000', '123456')).resolves.toEqual({
      user: { id: '1001', name: 'Mock User' },
    });
  });

  test('register and resetPassword map frontend payload to backend contract', async () => {
    mockFetchJson({ code: '0', message: 'ok', data: '1002' });
    await expect(register('New User', 'abcdef', '13900000000', '1234')).resolves.toBe('1002');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/register',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'New User',
          password: 'abcdef',
          phone: '13900000000',
        }),
      })
    );

    mockFetchJson({ code: '0', message: 'ok', data: '1002' });
    await expect(resetPassword('13900000000', '1234', 'ghijkl')).resolves.toBe('1002');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/password/reset',
      expect.objectContaining({
        body: JSON.stringify({
          phone: '13900000000',
          newPassword: 'ghijkl',
        }),
      })
    );
  });

  test('logout succeeds when backend returns success flag', async () => {
    mockFetchJson({
      code: '0',
      message: 'ok',
      data: { success: true },
    });

    await expect(logout()).resolves.toBeUndefined();
  });

  test('throws backend message when api returns business error', async () => {
    mockFetchJson({
      code: 'ERR_AUTH_INVALID_PASSWORD',
      message: 'invalid password',
      data: null,
    });

    await expect(loginWithPassword('13800000000', 'wrong')).rejects.toThrow('invalid password');
  });

  test('throws parse error when response body is not valid json', async () => {
    mockFetchJson('<html>server error</html>');

    await expect(sendCode('13800000000')).rejects.toThrow('服务器响应格式错误');
  });
});
