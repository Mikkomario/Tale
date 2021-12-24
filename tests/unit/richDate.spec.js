import { RichDate } from '@/classes/tale/time/RichDate'
import { hours, minutes } from '@/classes/tale/time/Duration'

describe('RichDate', () => {
	const origin = new RichDate('2021-07-10T12:09');

	test('constructor & equals', () => {
		const time = origin.toDate.getTime();
		const date1 = new Date(time);
		expect(new RichDate(date1).equals(origin)).toBe(true);
		expect(new RichDate(time).equals(origin)).toBe(true);
		expect(origin.equals(origin)).toBe(true);
	})

	test('dayOfWeek', () => {
		expect(origin.dayOfWeekName).toBe('Saturday')
		expect(origin.dayOfWeekIndex).toBe(6);
	})
	test('dayOfMonth', () => {
		expect(origin.dayOfMonth).toBe(10);
		expect(origin.dayOfMonthString).toBe('10th');
	})
	test('month', () => {
		expect(origin.monthIndex).toBe(6);
		expect(origin.monthName).toBe('July');
	})
	test('year', () => {
		expect(origin.year).toBe(2021);
	})

	test('time accessors', () => {
		expect(origin.hour).toBe(12);
		expect(origin.minute).toBe(9);
		expect(origin.second).toBe(0);
		expect(origin.milli).toBe(0);
		expect(origin.hasTime).toBe(true);
	})
	test('time to string', () => {
		expect(origin.militaryTimeString).toBe('12:09');
		expect(origin.timeString).toBe('12:09 Noon');
	})

	test('time', () => {
		const time = origin.time
		expect(time.toFullHours).toBe(12);
		expect(time.minutesPart).toBe(9);
	})

	test('atBeginningOfDay', () => {
		const start = origin.atBeginningOfDay
		expect(start.time.isZero).toBe(true);
		expect(start.dayOfMonth).toBe(10);
	})
	test('atEndOfDay', () => {
		const end = origin.atEndOfDay
		expect(end.time.isZero).toBe(true);
		expect(end.dayOfMonth).toBe(11);
	})

	test('Date +', () => {
		const date = new Date('2021-07-10T12:09');
		const date2 = new Date(date.getTime() + 3);
		expect(date.getMilliseconds()).toBe(0);
		expect(date2.getMilliseconds()).toBe(3);
	})

	test('plus', () => {
		expect(origin.plus(1).milli).toBe(1);
		expect(origin.plus(60001).minute).toBe(10);
		expect(origin.plus(hours(2)).hour).toBe(14);
		expect(origin.plus(hours(17)).dayOfMonth).toBe(11);
	})
	test('minus', () => {
		expect(origin.minus(origin.atBeginningOfDay).toFullHours).toBe(12);
		expect(origin.minus(hours(2)).hour).toBe(10);
	})

	test('tomorrow', () => {
		const t = origin.tomorrow;
		expect(t.dayOfWeekIndex).toBe(0);
		expect(t.dayOfWeekName).toBe('Sunday');
		expect(t.hour).toBe(12);
		expect(t.minute).toBe(9);
	})

	test('hasSameTimeAs', () => {
		expect(origin.hasSameTimeAs(origin)).toBe(true);
		expect(origin.tomorrow.hasSameTimeAs(origin)).toBe(true);
		expect(origin.plus(hours(1)).hasSameTimeAs(origin)).toBe(false);
		expect(origin.atBeginningOfDay.hasSameTimeAs(origin)).toBe(false);
	})
	test('hasSameDateAs', () => {
		expect(origin.plus(hours(2)).hasSameDateAs(origin)).toBe(true);
		expect(origin.tomorrow.hasSameDateAs(origin)).toBe(false);
	})

	test('yesterday', () => {
		const y = origin.yesterday;
		expect(y.dayOfWeekIndex).toBe(5);
		expect(y.hasSameTimeAs(origin)).toBe(true);
	})

	test('until', () => {
		const t = origin.tomorrow;
		expect(origin.until(t).toHours).toBe(24);
		expect(t.until(origin).toHours).toBe(-24);

		const a = origin.plus(minutes(5));
		expect(origin.until(a).toMinutes).toBe(5);
		expect(a.until(origin).toMinutes).toBe(-5);
	})
	test('since', () => {
		const t = origin.tomorrow;
		expect(origin.since(t).toHours).toBe(-24);
		expect(t.since(origin).toHours).toBe(24);

		const a = origin.plus(minutes(5));
		expect(origin.since(a).toMinutes).toBe(-5);
		expect(a.since(origin).toMinutes).toBe(5);
	})

	test('toEpochMillis conversion', () => {
		const parsed = RichDate.fromEpochMillis(origin.toEpochMillis)
		expect(parsed.equals(origin)).toBe(true)
	})
})