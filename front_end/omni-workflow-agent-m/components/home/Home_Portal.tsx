import React, { useMemo, useState } from 'react';
import { NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import {
  hasAnyPortalData,
  hasTodoData,
  hasWorkflowData,
} from '@/components/home/Home_Portal_bin/Home_Portal_data';
import { useThemeContext } from '@/constants/Theme-Context';

import { Lunar } from 'lunar-javascript';

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
// 可滑动月份范围，前后各12个月
const MONTH_RANGE = 12;
// 页面总数 = 当前月 + 前后各12个月
const PAGE_COUNT = MONTH_RANGE * 2 + 1;

type MonthMeta = {
  key: string;
  year: number;
  month: number;
};

type CalendarCell = {
  key: string;
  iso: string;
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  lunarText: string;
};

type PortalCardItem = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
};

// 日期格式化为 ISO 字符串，格式为 YYYY-MM-DD
function formatIso(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 日期计算工具函数
function addMonths(baseDate: Date, offset: number): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
}

function addDays(baseDate: Date, offset: number): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function getLunarDisplay(date: Date): string {
  try {
    const lunar = Lunar.fromDate(date);
    const lunarDay = lunar.getDayInChinese();
    if (lunarDay === '初一') {
      return `${lunar.getMonthInChinese()}月`;
    }
    return lunarDay;
  } catch (_error) {
    return '';
  }
}

function getLunarDetail(date: Date) {
  try {
    const lunar = Lunar.fromDate(date);
    return {
      dayLine: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      detailLine: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`,
    };

  } catch (_error) {
    return {
      dayLine: '测试农历日期',
      detailLine: '测试农历详细信息',
    };
  }
}


function buildMonthCells(targetYear: number, targetMonth: number): CalendarCell[] {
  const firstDate = new Date(targetYear, targetMonth, 1);
  const leadingDays = getMondayFirstWeekday(firstDate);
  const gridStartDate = new Date(targetYear, targetMonth, 1 - leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStartDate, index);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const isCurrentMonth = year === targetYear && month === targetMonth;

    return {
      key: `${year}-${month + 1}-${day}`,
      iso: formatIso(date),
      year,
      month,
      day,
      isCurrentMonth,
      lunarText: getLunarDisplay(date),
    };
  });
}

function buildMonthRange(anchorDate: Date): MonthMeta[] {
  return Array.from({ length: PAGE_COUNT }, (_, index) => {
    const date = addMonths(anchorDate, index - MONTH_RANGE);
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      key: `${year}-${month + 1}`,
      year,
      month,
    };
  });
}

function getDisplayWeekday(date: Date): string {
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六' ];
    return week[date.getDay()];
}

export default function Home_Portal() {

  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const today = useMemo(() => new Date(), []);
  const initialDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  const [activeMonthIndex, setActiveMonthIndex] = useState(MONTH_RANGE);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);

  const months = useMemo(() => buildMonthRange(initialDate), [initialDate]);

  // 月份数据预计算，避免滑动时卡顿 / key 为 'year-month' 格式，方便直接访问
  const monthCellMap = useMemo(() => {
    const map = new Map<string, CalendarCell[]>();
    months.forEach((monthItem) => {
      map.set(monthItem.key, buildMonthCells(monthItem.year, monthItem.month));
    });
    return map;
  }, [months]);

  const activeMonth = months[activeMonthIndex];
  const selectedIso = formatIso(selectedDate);
  const selectedLunar = getLunarDetail(selectedDate);

  const countdownCards: PortalCardItem[] = [
    { id: 'card_1', title: '测试消息模板 A', subtitle: '测试内容：这是第一条倒计时消息', badge: '1天' },
    { id: 'card_2', title: '测试消息模板 B', subtitle: '测试内容：这是第二条倒计时消息', badge: '3天' },
  ];

  const palette = isDark
    ? {
        pageBg: '#0D0F14',
        cardBg: '#171A21',
        cardBgSoft: '#1E222B',
        cardShadow: '#000000',
        primary: '#4E9BFF',
        primaryText: '#F8FBFF',
        dayText: '#E4E8EF',
        lunarText: '#98A0AF',
        mutedDay: '#5D6472',
        weekdayText: '#8E95A3',
        titleText: '#F3F6FA',
        bodyText: '#B4BCCB',
      }
    : {
        pageBg: '#F4F5F9',
        cardBg: '#FFFFFF',
        cardBgSoft: '#FFFFFF',
        cardShadow: '#9AA9C4',
        primary: '#3B82F6',
        primaryText: '#FFFFFF',
        dayText: '#20242D',
        lunarText: '#7E8592',
        mutedDay: '#D0D5DE',
        weekdayText: '#8A919D',
        titleText: '#262B35',
        bodyText: '#7A818E',
      };

  // 月份切换回调，更新 activeMonthIndex 和 selectedDate（保持日期不变，自动适配当月天数）
  const onPageSelected = (event: NativeSyntheticEvent<{ position: number }>) => {
    const nextIndex = event.nativeEvent.position;
    setActiveMonthIndex(nextIndex);

    const monthMeta = months[nextIndex];
    if (!monthMeta) return;

    setSelectedDate((prev) => {
      const nextDay = Math.min(prev.getDate(), getDaysInMonth(monthMeta.year, monthMeta.month));
      return new Date(monthMeta.year, monthMeta.month, nextDay);
    });
  };

  const onPressCurrentMonthDate = (cell: CalendarCell) => {
    if (!cell.isCurrentMonth) return;
    setHasUserSelectedDate(true);
    setSelectedDate(new Date(cell.year, cell.month, cell.day));
  };

  return (
    // 整体使用 ScrollView 包裹，允许内容超出屏幕高度时滚动查看
    <ScrollView
      style={[styles.container, { backgroundColor: palette.pageBg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.calendarCard,
          {
            backgroundColor: palette.cardBg,
            shadowColor: palette.cardShadow,
          },
        ]}
      >
        <View style={styles.monthHeader}>
          <Text style={[styles.monthHeaderText, { color: palette.titleText }]}>
            {activeMonth.year}年{activeMonth.month + 1}月
          </Text>
          <Text style={[styles.monthHeaderSubText, { color: palette.bodyText }]}>左右滑动切换月份</Text>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: palette.weekdayText }]}>{label}</Text>
            </View>
          ))}
        </View>

        <PagerView style={styles.pager} initialPage={MONTH_RANGE} onPageSelected={onPageSelected}>
          {months.map((monthItem) => {
            const monthCells = monthCellMap.get(monthItem.key) ?? [];

            return (
              <View key={monthItem.key} style={styles.monthPage}>
                <View style={styles.grid}>
                  {monthCells.map((cell) => {
                    const isSelected = selectedIso === cell.iso;
                    const isToday = cell.isCurrentMonth && cell.iso === formatIso(today);
                    const showSelectedOutline = hasUserSelectedDate && isSelected && !isToday;
                    const hasTodo = cell.isCurrentMonth && hasTodoData(cell.month + 1, cell.day);
                    const hasWorkflow = cell.isCurrentMonth && hasWorkflowData(cell.month + 1, cell.day);
                    const hasAnyData = cell.isCurrentMonth && hasAnyPortalData(cell.month + 1, cell.day);
                    const textColor = isToday
                      ? palette.primaryText
                      : !cell.isCurrentMonth
                        ? palette.mutedDay
                        : hasAnyData
                          ? palette.primary
                          : palette.dayText;

                    const lunarColor = isToday
                      ? palette.primaryText
                      : !cell.isCurrentMonth
                        ? palette.mutedDay
                        : palette.lunarText;

                    return (
                      <View key={cell.key} style={styles.gridCell}>
                        <Pressable
                          onPress={() => onPressCurrentMonthDate(cell)}
                          disabled={!cell.isCurrentMonth}
                          style={[
                            styles.datePressable,
                            isToday && { backgroundColor: palette.primary },
                            showSelectedOutline && styles.datePressableOutlined,
                            showSelectedOutline && { borderColor: palette.primary },
                          ]}
                        >
                          <Text style={[styles.dayNumber, { color: textColor }]}>{cell.day}</Text>
                          <Text style={[styles.lunarLabel, { color: lunarColor }]}>{cell.lunarText || '测试'}</Text>
                          {(hasTodo || hasWorkflow) && (
                            <View style={styles.contentDotsRow}>
                              {hasTodo && <View style={styles.contentDotTodo} />}
                              {hasWorkflow && (
                                <View
                                  style={[
                                    styles.contentDotWorkflow,
                                    { backgroundColor: palette.primary },
                                  ]}
                                />
                              )}
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </PagerView>

        <View style={styles.handleTrack}>
          <View style={[styles.handleThumb, { backgroundColor: isDark ? '#3B4250' : '#D7DAE1' }]} />
        </View>
      </View>

      <View
        style={[
          styles.detailCard,
          {
            backgroundColor: palette.cardBgSoft,
            shadowColor: palette.cardShadow,
          },
        ]}
      >
        <Text style={[styles.detailTitle, { color: palette.primary }]}>{selectedLunar.dayLine}</Text>
        <Text style={[styles.detailSubTitle, { color: palette.bodyText }]}> 
          {selectedLunar.detailLine} | {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日{' '}
          {getDisplayWeekday(selectedDate)}
        </Text>
        <Text style={[styles.detailBody, { color: palette.bodyText }]}>
          测试文本：这是选中日期的详情内容，用于占位展示排版和层次结构。
        </Text>
      </View>

      <View style={styles.cardList}>
        {countdownCards.map((card) => (
          <View
            key={card.id}
            style={[
              styles.countdownCard,
              {
                backgroundColor: palette.cardBgSoft,
                shadowColor: palette.cardShadow,
              },
            ]}
          >
            <View style={styles.countdownLeft}>
              <Text style={[styles.countdownTitle, { color: palette.titleText }]}>{card.title}</Text>
              <Text style={[styles.countdownSub, { color: palette.bodyText }]}>{card.subtitle}</Text>
            </View>
            <Text style={[styles.countdownBadge, { color: palette.titleText }]}>{card.badge}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 56,
    gap: 16,
  },
  calendarCard: {
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  monthHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  monthHeaderSubText: {
    fontSize: 12,
    fontWeight: '500',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  // 
  weekdayCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0.4,  // 
  },
  weekdayText: {
    fontSize: 17,
    fontWeight: '500',
  },
  // 
  pager: {
    height: 285,
  },
  monthPage: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  // 
  datePressable: {
    width: 44,
    minHeight: 54,  // 
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3, // 
  },
  datePressableOutlined: {
    borderWidth: 1.5,
  },
  // 
  dayNumber: {
    fontSize: 24,
    fontWeight: '500',    // 
    lineHeight: 24,       // 
    textAlign: 'center',
  },
  // 
  lunarLabel: {
    fontSize: 11,
    lineHeight: 13,
    marginTop: 0,
  },
  contentDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 4,
  },
  contentDotTodo: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5A5F',
  },
  contentDotWorkflow: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  handleTrack: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  handleThumb: {
    width: 52,
    height: 6,
    borderRadius: 4,
    opacity: 0.9,
  },
  detailCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  detailTitle: {
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailSubTitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  detailBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardList: {
    gap: 12,
  },
  countdownCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  countdownLeft: {
    flex: 1,
    paddingRight: 12,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  countdownSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  countdownBadge: {
    fontSize: 18,
    fontWeight: '700',
  },
});
