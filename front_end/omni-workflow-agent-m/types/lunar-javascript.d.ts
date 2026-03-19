declare module 'lunar-javascript' {
  export interface LunarInstance {
    getDayInChinese(): string;
    getMonthInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
  }

  export const Lunar: {
    fromDate(date: Date): LunarInstance;
  };
}
