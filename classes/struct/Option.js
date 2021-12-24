import { Iterator } from './Iterator'
import { Iterable, ArrayBuilder, BuilderWrapper } from './Iterable'

// An immutable class that handles cases where a value is null
export class Option extends Iterable {
	// Accepts a value and wraps it
	// Converts undefined values to nulls (None case)
	constructor(val) {
		super();
		this._value = val === undefined ? null : val;
		this._empty = val === null || val === undefined || val === '';
	}

	// An empty option instance
	static none = new Option(null);
	// A defined option instance (val must not be null)
	static some(val) { return new Option(val) }

	// Wraps the value in an option, but doesn't wrap options
	static flat(val) {
		if (val instanceof Option)
			return val;
		else
			return new Option(val);
	}

	// Implemented
	get iterator() { return this.match(i => Iterator.once(i), () => Iterator.empty) }

	newBuilder() { return new BuilderWrapper(new ArrayBuilder(), array => {
		switch (array.length) {
			case 0: return Option.none
			case 1: return Option.some(array[0])
			default: return array
		}
	}) }

	// Value of this option. May be null.
	get value() { return this._value }
	// Returns value of this option. Throws if empty.
	get get() {
		if (this.isEmpty)
			throw new Error('None.get');
		else
			return this.value;
	}
	// Whether this option is empty (null)
	get isEmpty() { return this._empty }
	// Whether this option contains a non-null value
	get nonEmpty() { return !this.isEmpty }
	// Alias for nonEmpty
	get isDefined() { return this.nonEmpty }

	get size() {
		if (this.isEmpty)
			return 0
		else
			return 1
	}

	get head() { return this.value }
	get headOption() { return this }

	valueOf() { return this._value; }
	equals(other) { return (this.isEmpty && other.isEmpty) || (this.valueOf() === other.valueOf()) }
	toString() {
		if (this.isEmpty)
			return 'None'
		else
			return `Some(${this._value.toString()})`
	}

	// Returns this option if not empty, or the specified value as an option
	// Accepts: 
	// - def: () => Option[Any] - A function that returns an option
	// 		- NB: If the function doesn't return an option, the result is wrapped in one
	// 		- NB: The parameter doesn't HAVE to be a function, but that approach is often less optimal
	orElse(def) {
		if (this.isEmpty) {
			if (typeof def === 'function')
				return Option.flat(def())
			else
				return Option.flat(def)
		}
		else
			return this
	}
	// Returns the value of this option or the specified default value (call-by-name)
	getOrElse(def) {
		if (this.isEmpty) {
			if (typeof def === 'function')
				return def();
			else
				return def;
		}
		else
			return this.value;
	}

	// Performs a function over the value of this option, 
	// if one is defined
	foreach(f) {
		if (this.nonEmpty)
			f(this.value);
	}
	// Checks whether the specified function returns true 
	// for all (0-1) value(s) of this option
	// f should accept value and return true or false
	forall(f) {
		if (this.isEmpty)
			return true;
		else
			return f(this.value);
	}
	// Checks whether there exists a value in this option 
	// that fulfils the specified condition
	// f should accept value and return true or false
	exists(f) {
		if (this.isEmpty)
			return false;
		else
			return f(this.value);
	}

	find(f) { return this.filter(f); }
	filter(f) {
		if (this.isEmpty || f(this.value))
			return this;
		else
			return Option.none;
	}

	// Calls one of the specified functions, based on whether this option is defined or empty
	// Returns the return value of the called function
	match(valueHandler, emptyHandler) {
		if (this.isEmpty) {
			if (typeof emptyHandler === 'function')
				return emptyHandler();
			else
				return emptyHandler
		}
		else
			return valueHandler(this.value);
	}

	// Creates a new option based on the value of this option, if one is defined. 
	// Returns an empty option if this option is empty.
	map(f) {
		return this.match(v => new Option(f(v)), () => Option.none);
	}
}

export const None = Option.none
export function Some(val) { return Option.some(val) }