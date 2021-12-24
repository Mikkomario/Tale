import { None, Some } from './Option.js'

// A class that represents a success or a failure
export class Try {
	// Success is null on failure. Failure is None or Some(Error). 
	// Exactly one of these should be specified.
	constructor(s = null, f = None) {
		this._value = s;
		this._failure = f;
	}

	// Creates a new successful try. Value can be anything.
	static success(value) { return new Try(value) }
	// Creates a new failure. Value should be error or a string.
	static failure(error = new Error('Try failed')) {
		if (error instanceof Error)
			return new Try(null, Some(error));
		else if (typeof error === 'string')
			return new Try(null, Some(new Error(error)));
		else
			return new Try(null, Some(new Error('Try failed')));
	}
	// Creates a try by wrapping the specified function in a try catch.
	// If the specified parameter is not a function, wraps it into a success.
	static apply(f) {
		if (typeof f === 'function') {
			try { return Try.success(f()) }
			catch (error) { return Try.failure(error) } 
		} 
		else
			return Try.success(f);
	}

	valueOf() { return this._value }
	equals(other) { return this.valueOf() === other.valueOf() }

	// The success value of this try as an option
	get success() {
		if (this.isFailure)
			return None;
		else
			return Some(this._value);
	}
	// The failure / error of this try as an option
	get failure() { return this._failure }

	// Whether this try represents a failure
	get isFailure() { return this.failure.nonEmpty }
	// Whether this try represents a success
	get isSuccess() { return !this.isFailure }

	// The successful value of this try. Fails on failure.
	get get() {
		this.failure.foreach(e => throw e);
		return this._value;
	}

	// Handles either the successful value or the failure inside this try
	// First parameter handles success. Accepts successful value
	// Second parameter handles failure. Accepts an error.
	match(successHandler, errorHandler) {
		return this.failure.match(
			errorHandler, 
			() => successHandler(this._value)
		);
	}
}

// Alias for writing Try.failure(error)
export function Failure(error) { return Try.failure(error) }
// Alias for writing Try.success(value)
export function Success(value) { return Try.success(value) }