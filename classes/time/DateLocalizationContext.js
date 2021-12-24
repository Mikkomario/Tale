// An object used for producing localized date string content
export class DateLocalizationContext {
	// Accepts: 
	// - dayNames: [String] - Names of week days, starting from Sunday
	// - monthNames: [String] - Names of months, starting from January
	// - dayToString: Int => String - A function that accepts a day of month and returns a string representation (default = return as is)
	// - combineDayAndMonth: (String, String) => String - A function that accepts day and month strings and combines them
	constructor(dayNames, monthNames, dayToString = d => d, combineDayAndMonth = (day, month) => `${day} ${month}`) {
		this.dayNames = dayNames
		this.monthNames = monthNames
		this.dayToString = dayToString
		this.combineDayAndMonth = combineDayAndMonth
	}

	// Accepts:
	// - dayOfMonth: Int - [1, 31] - Day of month
	// - monthIndex: Int - [0, 11] - Month index (starting from 0 = January)
	// Returns: A string containing both values
	dayMonthString(dayOfMonth, monthIndex) {
		return this.combineDayAndMonth(this.dayToString(dayOfMonth), this.monthNames[monthIndex])
	}
}

// Context that produces english date strings
export const englishDateContext = new DateLocalizationContext(
	['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], 
	['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 
	day => {
		if (day === 1)
			return `${day}st`;
		else if (day === 2)
			return `${day}nd`;
		else if (day === 3)
			return `${day}rd`;
		else
			return `${day}th`
	}, 
	(day, month) => `${day} of ${month}`)