import {
  deleteDayData,
  getMonthCalendar,
  updateDayData,
  type PortalMonthData,
} from './home-component-api';

function mockFetchJson(payload: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    ),
    status: 200,
  } as unknown as Response);
}

describe('home-component-api', () => {
  test('getMonthCalendar returns month data', async () => {
    const monthData: PortalMonthData = {
      7: {
        keys: ['summary-0507'],
        detailBodyText: '5月7日：新增 portal 数据。',
      },
    };

    mockFetchJson({
      code: '0',
      message: 'ok',
      data: { monthData },
    });

    await expect(getMonthCalendar('1001', 2026, 5)).resolves.toEqual(monthData);
  });

  test('updateDayData and deleteDayData resolve on success', async () => {
    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });
    await expect(
      updateDayData('1001', 2026, 5, 7, {
        keys: ['summary-0507'],
        detailBodyText: 'portal day',
      })
    ).resolves.toBeUndefined();

    mockFetchJson({ code: '0', message: 'ok', data: { success: true } });
    await expect(deleteDayData('1001', 2026, 5, 7)).resolves.toBeUndefined();
  });

  test('throws backend message and parse errors', async () => {
    mockFetchJson({
      code: 'ERR_USER_NOT_FOUND',
      message: 'user not found',
      data: null,
    });
    await expect(getMonthCalendar('missing', 2026, 5)).rejects.toThrow('user not found');

    mockFetchJson('portal html error');
    await expect(getMonthCalendar('1001', 2026, 5)).rejects.toThrow('服务器响应格式错误');
  });
});
