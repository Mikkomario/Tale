import { Some, None } from './Option'
import { Pair } from './Pair'

// Either contains a value either on the left or on the right side
// Eithers can be used to divide between two contrary cases (e.g. success and failure)
export class Either {
	constructor(value, isRight = true) {
		this._value = value
		this._isRight = isRight
	}

	static left(value) { return new Either(value, false) }
	static right(value) { return new Either(value, true) }


	// COMPUTED	-----------------------

	// Value held within this either, whether this is left or right
	get value() { return this._value }

	// Whether this is a right side either
	get isRight() { return this._isRight }
	// Whether this is a left side either
	get isLeft() { return !this._isRight }

	// Right side value as an Option
	get right() {
		if (this._isRight)
			return Some(this._value)
		else
			return None
	}
	// Left side value as an Option
	get left() {
		if (this._isRight)
			return None
		else
			return Some(this._value)
	}

	// This either as a pair where one side is None and another is Some
	get toPair() { return new Pair(this.left, this.right) }


	// OTHER-----------------------------

	// Calls one of the specified functions, based on the side of this Either
	// Accepts: 
	// - Function to call if this is left
	// - Function to call if this is right
	// The called function receives the value of this either
	// Returns function result
	match(takeLeft, takeRight) {
		if (this._isRight)
			return takeRight(this._value)
		else
			return takeLeft(this._value)
	}
}

export function Right(value) { return Either.right(value) }
export function Left(value) { return Either.left(value) }