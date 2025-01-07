import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export class DateUtils {
  private static _configuredTimezone: string;

  constructor() {
    try {
      DateUtils._configuredTimezone = process.env.APP_TIMEZONE ?? 'UTC';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      DateUtils._configuredTimezone = 'UTC';
    }
  }

  static now(): dayjs.Dayjs {
    return dayjs().tz(DateUtils._configuredTimezone);
  }

  static today(): dayjs.Dayjs {
    return dayjs().startOf('day');
  }

  static tomorrow(): dayjs.Dayjs {
    return dayjs().add(1, 'day').startOf('day');
  }

  static yesterday(): dayjs.Dayjs {
    return dayjs().subtract(1, 'day').startOf('day');
  }

  static parse(dateString: string, formatString: string): dayjs.Dayjs {
    return dayjs(dateString, formatString);
  }

  static format(date: dayjs.Dayjs, formatString: string): string {
    return date.format(formatString);
  }

  static addDays(date: dayjs.Dayjs, days: number): dayjs.Dayjs {
    return date.add(days, 'day');
  }

  static subDays(date: dayjs.Dayjs, days: number): dayjs.Dayjs {
    return date.subtract(days, 'day');
  }

  static addMonths(date: dayjs.Dayjs, months: number): dayjs.Dayjs {
    return date.add(months, 'month');
  }

  static subMonths(date: dayjs.Dayjs, months: number): dayjs.Dayjs {
    return date.subtract(months, 'month');
  }

  static addYears(date: dayjs.Dayjs, years: number): dayjs.Dayjs {
    return date.add(years, 'year');
  }

  static subYears(date: dayjs.Dayjs, years: number): dayjs.Dayjs {
    return date.subtract(years, 'year');
  }

  static startOfDay(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.startOf('day');
  }

  static endOfDay(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.endOf('day');
  }

  static startOfMonth(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.startOf('month');
  }

  static endOfMonth(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.endOf('month');
  }

  static startOfYear(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.startOf('year');
  }

  static endOfYear(date: dayjs.Dayjs): dayjs.Dayjs {
    return date.endOf('year');
  }

  static isBefore(date: dayjs.Dayjs, comparisonDate: dayjs.Dayjs): boolean {
    return date.isBefore(comparisonDate);
  }

  static isAfter(date: dayjs.Dayjs, comparisonDate: dayjs.Dayjs): boolean {
    return date.isAfter(comparisonDate);
  }

  static isToday(date: dayjs.Dayjs): boolean {
    return date.isSame(dayjs(), 'day');
  }

  static isTomorrow(date: dayjs.Dayjs): boolean {
    return date.isSame(dayjs().add(1, 'day'), 'day');
  }

  static isYesterday(date: dayjs.Dayjs): boolean {
    return date.isSame(dayjs().subtract(1, 'day'), 'day');
  }

  static isValid(date: any): boolean {
    return dayjs(date).isValid();
  }

  static differenceInDays(date1: dayjs.Dayjs, date2: dayjs.Dayjs): number {
    return date1.diff(date2, 'day');
  }

  static differenceInHours(date1: dayjs.Dayjs, date2: dayjs.Dayjs): number {
    return date1.diff(date2, 'hour');
  }

  static differenceInMinutes(date1: dayjs.Dayjs, date2: dayjs.Dayjs): number {
    return date1.diff(date2, 'minute');
  }

  static differenceInSeconds(date1: dayjs.Dayjs, date2: dayjs.Dayjs): number {
    return date1.diff(date2, 'second');
  }

  static distanceToNow(date: dayjs.Dayjs): string {
    return date.fromNow();
  }

  static getDate(date: dayjs.Dayjs): string {
    return date.format('D MMMM YYYY');
  }

  static getTime(date: dayjs.Dayjs): string {
    return date.format('HH:mm');
  }

  static getDateHuman(date: dayjs.Dayjs): string {
    return date.fromNow();
  }

  static getDateInformative(date: dayjs.Dayjs): string {
    return date.format('dddd, MMMM D, YYYY');
  }

  static getDateTimeInformative(date: dayjs.Dayjs): string {
    return date.format('dddd, MMMM D, YYYY HH:mm');
  }

  static getDateWithTimezone(date: dayjs.Dayjs, timezone: string): string {
    return date.tz(timezone).format('D MMMM YYYY');
  }

  static getDateTimeWithTimezone(date: dayjs.Dayjs, timezone: string): string {
    return date.tz(timezone).format('D MMMM YYYY HH:mm z');
  }

  static getDateInformativeWithTimezone(
    date: dayjs.Dayjs,
    timezone: string,
  ): string {
    return date.tz(timezone).format('dddd, MMMM D, YYYY z');
  }

  static getDateTimeInformativeWithTimezone(
    date: dayjs.Dayjs,
    timezone: string,
  ): string {
    return date.tz(timezone).format('dddd, MMMM D, YYYY HH:mm z');
  }
}
