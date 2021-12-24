
const millisToSeconds = 1000;
const millisToMinutes = millisToSeconds * 60;
const millisToHours = millisToMinutes * 60;
const millisToDays = millisToHours * 24;
const millisToWeeks = millisToDays * 7;

// function secondsSince(date) { return Math.floor(date - new Date()) / millisToSeconds }
// function hoursSince(date) { return Math.floor(date - new Date()) / millisToHours }
function floatToString(float) {
	if (float % 1 === 0)
		return float.toFixed(0);
	else
		return float.toFixed(1);
}

export class Duration {
	constructor(millis) {
		this._millis = millis instanceof Date ? millis.getTime() : millis;
	}

	static zero = new Duration(0);

	static flat(d) {
		if (d instanceof Duration)
			return d
		else if (typeof d === 'string')
			return new Duration(new Date(d))
		else
			return new Duration(d)
	}

	valueOf() { return this._millis }
	equals(other) { return this.valueOf() === other.valueOf() }
	toString() {
		if (this.isNegative) {
			const days = this.toDays;
			if (days < -1)
				return `${floatToString(days)} days`;
			else {
				const hours = this.toHours;
				if (hours < -1)
					return `${floatToString(hours)} hours`
				else {
					const minutes = this.toMinutes;
					if (minutes < -1)
						return `${floatToString(minutes)} minutes`
					else {
						const seconds = this.toSeconds;
						if (seconds < -1)
							return `${floatToString(seconds)} seconds`
						else
							return `${this.toMillis} milliseconds`
					}
				}
			}
		}
		else {
			const weeks = this.toFullWeeks
			if (weeks > 1) {
				const weekString = `${weeks} weeks`
				const days = this.daysPart
				if (days >= 0.1)
					return `${weekString} ${floatToString(days)} days`
				else
					return weekString;
			}
			else {
				const days = this.toFullDays;
				if (days > 1) {
					const dayString = `${days} days`;
					const hours = this.hoursPart;
					if (hours >= 0.1)
						return `${dayString} ${floatToString(hours)} hours`;
					else
						return dayString;
				}
				else {
					const hours = this.toFullHours;
					if (hours > 1) {
						const hourString = `${hours} hours`;
						const minutes = this.minutesPart;
						if (minutes >= 0.1)
							return `${hourString} ${floatToString(minutes)} minutes`;
						else
							return hourString;
					}
					else {
						const minutes = this.toFullMinutes;
						if (minutes > 1) {
							const minuteString = `${minutes} minutes`
							const seconds = this.secondsPart;
							if (seconds >= 0.1)
								return `${minuteString} ${seconds} seconds`
							else
								return minuteString;
						}
						else {
							const seconds = this.toSeconds;
							if (seconds > 1)
								return `${floatToString(seconds)} seconds`
							else
								return `${this.toMillis} milliseconds`
						}
					}
				}
			}
		}
	}
	get toJson() { return this._millis }

	get isPositive() { return this._millis > 0 }
	get isNegative() { return this._millis < 0 }
	get isZero() { return this._millis === 0 }

	get toMillis() { return this._millis }
	get millisPart() { return this._millis % millisToSeconds }
	get isMillis() { return this._millis > 1 }

	get toSeconds() { return this._millis / millisToSeconds }
	get toFullSeconds() { return Math.floor(this.toSeconds) }
	get secondsPart() { return this.toSeconds % 60 }
	get fullSecondsPart() { return this.toFullSeconds % 60 }
	get isSeconds() { return this._millis >= 2 * millisToSeconds }

	get toMinutes() { return this._millis / millisToMinutes }
	get toFullMinutes() { return Math.floor(this.toMinutes) }
	get minutesPart() { return this.toMinutes % 60 }
	get fullMinutesPart() { return this.toFullMinutes % 60 }
	get isMinutes() { return this._millis >= 2 * millisToMinutes }

	get toHours() { return this._millis / millisToHours }
	get toFullHours() { return Math.floor(this.toHours) }
	get hoursPart() { return this.toHours % 24 }
	get fullHoursPart() { return this.toFullHours % 24 }
	get isHours() { return this._millis >= 2 * millisToHours }

	get toDays() { return this._millis / millisToDays }
	get toFullDays() { return Math.floor(this.toDays) }
	get daysPart() { return this.toDays % 7 }
	get fullDaysPart() { return this.toFullDays % 7 }
	get isDays() { return this._millis >= 2 * millisToDays }

	get toWeeks() { return this._millis / millisToWeeks }
	get toFullWeeks() { return Math.floor(this.toWeeks) }
	get isWeeks() { return this._millis >= 2 * millisToWeeks }

	plus(other) {
		if (other instanceof Duration)
			return new Duration(this._millis + other.toMillis);
		else if (other instanceof Date)
			return new Duration(this._millis + other.getTime());
		else
			return new Duration(this._millis + other);
	}
	minus(other) {
		if (other instanceof Duration)
			return new Duration(this._millis - other.toMillis);
		else if (other instanceof Date)
			return new Duration(this._millis - other.getTime());
		else
			return new Duration(this._millis - other);
	}
	times(mod) {
		return new Duration(this._millis * mod)
	}
	dividedBy(div) {
		return new Duration(this._millis / div)
	}
}

export function millis(m) { return new Duration(m) }
export function seconds(s) { return new Duration(s * millisToSeconds) }
export function minutes(m) { return new Duration(m * millisToMinutes) }
export function hours(h) { return new Duration(h * millisToHours) }
export function days(d) { return new Duration(d * millisToDays) }
export function weeks(w) { return new Duration(w * millisToWeeks) }