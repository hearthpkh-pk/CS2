import { PublicHoliday } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';

/**
 * HolidayService (The Brain)
 * Handles all logic related to holidays and 2x pay calculation.
 * Separated from UI for reusability.
 */
export const holidayService = {
  /**
   * Checks if a specific date is a holiday.
   * Handles both recurring (MM-DD) and one-time (YYYY-MM-DD) dates.
   */
  getHoliday(date: Date, holidays: PublicHoliday[]): PublicHoliday | undefined {
    const monthDay = format(date, 'MM-dd');
    const fullDate = format(date, 'yyyy-MM-dd');

    return holidays.find(h => {
      if (h.isRecurring) {
        return h.date === monthDay;
      }
      return h.date === fullDate;
    });
  },

  /**
   * Returns the pay multiplier for a specific date (e.g. 2.0 for holiday).
   * Default is 1.0 (Regular Pay).
   */
  getPayMultiplier(date: Date, holidays: PublicHoliday[]): number {
    const holiday = this.getHoliday(date, holidays);
    return holiday ? holiday.multiplier : 1.0;
  },

  /**
   * Formats holidays for the Policy Center rules.
   */
  generatePolicyDescription(holidays: PublicHoliday[]): string {
    if (!holidays || holidays.length === 0) return 'ไม่มีวันหยุดพิเศษที่ระบบกำหนด';

    const list = holidays
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(h => `- ${h.name} (${h.date}): รับค่าแรง ${h.multiplier} เท่า`)
      .join('\n');

    return `นโยบายวันหยุดและสวัสดิการพิเศษ:\nพนักงานที่ปฏิบัติงานในวันหยุดนักขัตฤกษ์หรือวันพิเศษที่บริษัทกำหนด จะได้รับค่าแรงพิเศษ (2 แรง) โดยอัตโนมัติ ดังนี้:\n\n${list}\n\n*กรณีไม่มาทำงานในวันดังกล่าว จะได้รับค่าแรงปกติโดยไม่มีการหักเงินเดือน`;
  }
};
