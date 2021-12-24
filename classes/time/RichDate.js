import { Duration, hours, minutes, seconds, millis } from './Duration'
import { englishDateContext } from './DateLocalizationContext'

export function localTimeZone() { return Intl.DateTimeFormat().resolvedOptions().timeZone }

// A date wrapper class with extended features
class DateLike {
	// Intended to be overwritten
	get toDate() { return new Date() }

	// Number of milliseconds since the EPOCH
	get toEpochMillis() { return this.toDate.getTime() }
	get toNewDate() { return new Date(this.toEpochMillis) }
	get toJson() { return this.toDate.toISOString() }
	get toHeaderValue() { return this.toDate.toUTCString() }

	valueOf() { return this.toDate.valueOf() }
	equals(other) { return this.valueOf() === other.valueOf() }
	toString(context = englishDateContext) { 
		if (this.hasTime)
			return `${this.dateStringIn(context)} ${this.timeString} (${this.timeZone})`
		else
			return this.dateStringIn(context);
	}

	// Getters for days, weekdays, months, and years
	get dayOfWeekIndex() { return this.toDate.getDay() }
	get dayOfWeekName() { return this.dayOfWeekNameIn(englishDateContext) }
	get dayOfMonth() { return this.toDate.getDate() }
	get dayOfMonthString() { return this.dayOfMonthStringIn(englishDateContext) }
	get monthIndex() { return this.toDate.getMonth() }
	get monthName() { return this.monthNameIn(englishDateContext) }
	get year() { return this.toDate.getFullYear() }
	get dateString() { return this.dateStringIn(englishDateContext) }

	// Getters for time
	get hour() { return this.toDate.getHours() }
	get minute() { return this.toDate.getMinutes() }
	get second() { return this.toDate.getSeconds() }
	get milli() { return this.toDate.getMilliseconds() }
	get hasTime() { return this.hour > 0 || this.minute > 0 }
	// Time in American format (with Midnight and Noon options for clarity). 
	// E.g. '1:15 PM'm '12:05 Midnight' or '12:45 Noon'
	get timeString() {
		const m = this.minute;
		const mString = m < 10 ? `0${m}` : m.toString();

		const rawHours = this.hour;
		const h = rawHours > 12 ? rawHours - 12 : (rawHours < 1 ? 12 : rawHours);
		
		const endString = rawHours === 0 ? 'Midnight' : (rawHours === 12 ? 'Noon' : (rawHours > 12 ? 'PM' : 'AM'));

		return `${h}:${mString} ${endString}`;
	}
	// Time in military format. E.g. '17:45'
	get militaryTimeString() {
		const h = this.hour;
		const m = this.minute;
		const hString = h < 10 ? `0${h}` : h.toString();
		const mString = m < 10 ? `0${m}` : m.toString();
		return `${hString}:${mString}`
	}
	// Time portion of this date (duration since midnight)
	get time() { return hours(this.hour).plus(minutes(this.minute)).plus(seconds(this.second)).plus(millis(this.milli)) }

	get timeZone() { return localTimeZone() }

	get isInPast() { return this.toDate < new Date() }
	get isInFuture() { return this.toDate > new Date() }
	get durationInPast() { return this.until(new Date()) }
	get durationInFuture() { return this.since(new Date()) }

	// Name of this date's week day in the specified context
	// Expects DateLocalizationContext as a parameter
	dayOfWeekNameIn(context) { return context.dayNames[this.dayOfWeekIndex] }
	// Returns a string representing this date's day of month
	// Expects DateLocalizationContext as a parameter
	dayOfMonthStringIn(context) { return context.dayToString(this.dayOfMonth) }
	// Returns the name of this date's month
	// Expects DateLocalizationContext as a parameter
	monthNameIn(context) { return context.monthNames[this.monthIndex] }

	// Accepts a DateLocalizationContext
	// Returns a string describing the date portion of this date
	dateStringIn(context) {
		// Uses different formatting based on time and context
		// Case: Past time
		if (this.isInPast) {
			const days = this.durationInPast.toDays
			// Case: Far in the past
			if (days > 6)
				return `${context.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}`
			// Case: Very close in the past
			else if (days < 2)
				return `${this.dayOfWeekNameIn(context)} ${context.dayMonthString(this.dayOfMonth, this.monthIndex)}`
			// Case: In recent past
			else
				return `${this.dayOfWeekNameIn(context)} ${context.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}`
		}
		else {
			if (this.durationInFuture.toDays > 6) {
				// Case: Further in the same year
				if (this.year === new Date().getFullYear())
					return context.dayMonthString(this.dayOfMonth, this.monthIndex)
				// Case: In a future year
				else
					return `${context.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}`
			}
			// Case: In close future
			else
				return `${this.dayOfWeekNameIn(context)} ${context.dayMonthString(this.dayOfMonth, this.monthIndex)}`
		}
	}

	hasSameDateAs(other) {
		return this.dayOfMonth === other.dayOfMonth && this.monthIndex === other.monthIndex && this.year === other.year;
	}
	hasSameTimeAs(other) {
		if (other instanceof Duration)
			return this.time.equals(other);
		else
			return this.time.equals(other.time);
	}

	until(date) {
		if (date instanceof DateLike)
			return new Duration(date.toDate - this.toDate);
		else
			return new Duration(date - this.toDate);
	}
	daysUntil(date) { return this.until(date).toDays }
	since(date) {
		if (date instanceof DateLike)
			return new Duration(this.toDate - date.toDate);
		else
			return new Duration(this.toDate - date);
	}
	daysSince(date) { return this.since(date).toDays }

	// Offers limited implementation of these methods 
	// (because new RichDate(...) is not available here)
	minus(date) {
		if (date instanceof DateLike)
			return new Duration(this.toDate - date.toDate);
		else
			return new Duration(this.toDate - date);
	}
}

export class RichDate extends DateLike {
	constructor(wrapped = new Date()) {
		super();
		this._date = wrapped instanceof Date ? wrapped : new Date(wrapped);
	}

	static now() { return new RichDate() }

	// Parses a date from epoch millis value
	// Handles if given a string representing a millisecond count
	static fromEpochMillis(millis) { 
		if (typeof millis === 'string')
			return new RichDate(new Date(parseInt(millis, 10)))
		else
			return new RichDate(new Date(millis)) 
	}

	get toDate() { return this._date }

	get isToday() { return this.hasSameDateAs(new RichDate()) }
	get isTomorrow() { return this.hasSameDateAs(new RichDate().tomorrow) }

	get atBeginningOfDay() { return this.minus(this.time); }
	get atEndOfDay() { return this.tomorrow.atBeginningOfDay }
	get tomorrow() { return this.plus(hours(24)) }
	get yesterday() { return this.minus(hours(24)) }

	hasSameDateAs(other) {
		if (other instanceof DateLike)
			return this.dayOfMonth === other.dayOfMonth && this.monthIndex === other.monthIndex && this.year === other.year;
		else
			return this.hasSameDateAs(new RichDate(other));
	}
	hasSameTimeAs(other) {
		if (other instanceof DateLike)
			return this.time.equals(other.time);
		else if (other instanceof Duration)
			return this.time.equals(other);
		else
			return this.hasSameTimeAs(new RichDate(other));
	}

	plus(duration) {
		if (duration instanceof Duration)
			return new RichDate(new Date(this._date.getTime() + duration.toMillis));
		else if (duration instanceof DateLike)
			return new RichDate(new Date(this._date.getTime() + duration.toDate));
		else
			return new RichDate(new Date(this._date.getTime() + duration));	
	}
	minus(duration) {
		if (duration instanceof Duration)
			return new RichDate(new Date(this._date.getTime() - duration.toMillis));
		else if (duration instanceof DateLike)
			return new Duration(this._date.getTime() - duration.toDate);
		else if (duration instanceof Date)
			return new Duration(this._date.getTime() - duration);
		else
			return new RichDate(new Date(this._date.getTime() - duration));
	}

	before(other) {
		if (other instanceof Duration)
			return new RichDate(this._date - other.toMillis);
		else if (other instanceof DateLike)
			return new Duration(other.toDate - this._date);
		else if (other instanceof Date)
			return new Duration(other - this._date);
		else
			return new RichDate(this._date - other);
	}
	after(other) {
		if (other instanceof Duration)
			return new RichDate(this._date + other.toMillis);
		else if (other instanceof DateLike)
			return new Duration(this._date - other.toDate);
		else if (other instanceof Date)
			return new Duration(this._date - other);
		else
			return new RichDate(this._date + other);
	}
}

class CurrentDate extends DateLike {
	get isInPast() { return false }
	get isInFuture() { return false }

	// Converts this fluctuing date to a static date
	get static() { return new RichDate(this.toDate) }

	// Delegates some methods to the RichDate class
	get atBeginningOfDay() { return this.static.atBeginningOfDay }
	get atEndOfDay() { return this.static.atEndOfDay }

	plus(duration) { return this.static.plus(duration) }
	minus(duration) { return this.static.minus(duration) }

	before(other) { return this.static.before(other) }
	after(other) { return this.static.after(other) }
}

export const Now = new CurrentDate();