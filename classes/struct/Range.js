import { ArrayBuilder } from './Iterable'
import { IterableWithOption } from './IterableWithOption'
import { IteratorWithOption } from './IteratorWithOption'

export class RangeIterator extends IteratorWithOption {
	// CONSTRUCTOR	---------------------------

	// Accepts:
	// - first: Int - First number to return
	// - last: Int - Last number to return
	// - step: Int - Increment per call of .next() (default = 1)
	// - makeBuilder: () => Builder - Used for building map, etc. results from this iterator (default = array builder)
	constructor(first, last, step = 1, makeBuilder = () => new ArrayBuilder()) {
		super()
		this._next = first
		this.last = last
		this.step = step
		this._acceptCondition = step >= 0 ? function(a) { return a <= last } : function(a) { return a >= last }
		this.makeBuilder = makeBuilder
	}


	// IMPLEMENTED	--------------------------

	get hasNext() { return this._acceptCondition(this._next) }
	next() { 
		const result = this._next
		this._next += this.step
		return result
	}
	newBuilder() { return this.makeBuilder() }

	toString() {
		if (this.isEmpty)
			return 'empty'
		else
			return `${this.start} to ${this.last}`
	}

	get size() {
		if (this.hasNext)
			return Math.floor((this.last - this._next) / this.step) + 1
		else
			return 0
	}

	take(amount) {
		const newLast = this._next + (amount - 1) * this.step
		if (this.step > 0) {
			if (this.last < newLast)
				return this
			else
				return new RangeIterator(this._next, newLast, this.step, this.makeBuilder)
		}
		else if (this.last > newLast)
			return this
		else
			return new RangeIterator(this._next, newLast, this.step, this.makeBuilder)
	}
	drop(amount) {
		if (amount > 0)
			this._next += this.step * amount
		return this
	}
}

// Represents a range of numbers, from a to b
export class Range extends IterableWithOption {
	// CONSTRUCTOR	--------------------------

	// Creates a new Range
	// Accepts:
	// - start: Int - First number of this range (inclusive)
	// - end: Int - Ending number of this range (inclusive or exlusive)
	// - isInclusive: Boolean - Whether the 'end' parameter is included in this Range (default = false)
	// - step: Int - Increment for transitioning between numbers (default = 1) - Will be made of correct sign
	// - makeBuilder: () => Builder - A default builder constructor for .map, .flatMap etc. operations (default create new ArrayBuilder)
	constructor(start, end, isInclusive = false, step = 1, makeBuilder = () => new ArrayBuilder()) {
		super()
		this.start = start
		this._end = end
		this.isInclusive = isInclusive
		this.isForward = end >= start
		this.step = (this.isForward === (step >= 0)) ? step : -step
		this.makeBuilder = makeBuilder
	}


	// STATIC	------------------------------

	// An empty range (from 0 to 0 exclusive)
	static empty = new Range(0, 0)

	// Creates a single number Range
	// Accepts: 
	// - start: Int - The first and last number in this range (inclusive)
	// - makeBuilder: () => Builder - See constructor
	static from(start, makeBuilder = () => new ArrayBuilder()) {
		return new Range(start, start, true, 1, makeBuilder)
	}

	// Creats a new Range that always points forward / right / to larger number
	// Accepts: 
	// - first: Int - The first or the last number in this range (inclusive)
	// - last: Int  - The last or the first number in this range (inclusive)
	// - makeBuilder: () => Builder - see constructor
	static between(first, last, makeBuilder = () => new ArrayBuilder()) {
		if (first > last)
			return new Range(last, first, true, 1, makeBuilder)
		else
			return new Range(first, last, true, 1, makeBuilder)
	}


	// COMPUTED	------------------------------

	// The first number in this Range. Also known as 'start' or 'head'
	get first() { return this.start }

	// The EXCLUSIVE ending number of this range
	// May be smaller than the start, depending on Range direction
	get end() {
		if (this.isInclusive)
			return this._end + this.step
		else
			return this._end
	}

	// The smallest number in this range
	get min() {
		if (this.isForward)
			return this.first
		else
			return this.last
	}
	// The largest number in this range
	get max() {
		if (this.isForward)
			return this.last
		else
			return this.first
	}

	// Whether this range is from larger to smaller numbe
	// (opposite to isForward)
	get isBackward() { return !this.isForward }

	// The length of this range in numbers, ignoring step size
	get length() {
		if (this.isEmpty)
			return 0
		else if (this.isForward)
			return (this.last - this.start) + 1
		else
			return (this.start - this.last) + 1
	}

	// Returns: An iterator that goes through this range in reverse order
	get reverseIterator() {
		return new RangeIterator(this.last, this.first, -this.step, this.makeBuilder)
	}
	// A copy of this range that points to the opposite direction (first & last swapped)
	get reverse() {
		if (this.isEmpty)
			return this
		else
			return new Range(this.last, this.start, true, -this.step, this.makeBuilder)
	}
	// A copy of this range that points from the smaller to the larger number
	get forward() {
		if (this.isForward)
			return this
		else
			return this.reverse
	}
	// A copy of this range that points from the larger to the smaller number
	get backward() {
		if (this.isBackward)
			return this
		else
			return this.reverse
	}


	// IMPLEMENTED	--------------------------

	// The last number of this range, inclusive
	get last() {
		if (this.isInclusive)
			return this._end
		else
			return this._end - this.step
	}

	get iterator() { return new RangeIterator(this.start, this.last, this.step, this.makeBuilder) }

	get nonEmpty() { return this.isInclusive || this.start !== this._end }
	get isEmpty() { return !this.nonEmpty }

	// The length of this range as steps. Always >= 0
	get size() {
		return Math.floor(Math.abs((this.end - this.start) / this.step))
	}

	get head() { return this.start }

	newBuilder() { return this.makeBuilder() }

	// Checks whether this range contains a number
	// Accepts: 
	// - a: Number - A number to test
	// Returns: Whether that number falls into this range (although it may be skipped by larger steps)
	contains(a) {
		if (this.isForward)
			return a >= this.start && a <= this.last
		else
			return a <= this.start && a >= this.last
	}

	// Accepts: 
	// amount: Number - Number of STEPS to include
	// Returns: A copy of this range with maximum size of 'amount'
	take(amount) {
		if (amount <= 0)
			return new Range(this.start, this.start, false, this.step, this.makeBuilder)
		else if (amount >= this.size)
			return this
		else
			return new Range(this.start, this.start + (amount - 1) * this.step, true, this.step, this.makeBuilder)
	}
	// Accepts: 
	// amount: Number - Number of STEPS to exclude from the beginning of this range
	// Returns: A copy of this range with the first 'amount' steps skipped / removed
	drop(amount) {
		if (amount <= 0)
			return this
		else if (amount >= this.size)
			return new Range(this._end, this._end, false, this.step, this.makeBuilder)
		else
			return new Range(this.start + amount * this.step, this._end, this.isInclusive, this.step, this.makeBuilder)
	}


	// OTHER	--------------------------

	withStart(newStart) {
		return new Range(newStart, this._end, this.isInclusive, this.step, this.makeBuilder)
	}
	withEnd(newEnd) {
		return new Range(this.start, newEnd, false, this.step, this.makeBuilder)
	}
	withLast(newLast) {
		return new Range(this.start, newLast, true, this.step, this.makeBuilder)
	}
	// Accepts: 
	// newLast: Int - New last number of this range (inclusive)
	// Returns: A copy of this range with that number as the last number
	to(newLast) {
		return this.withLast(newLast)
	}
	// Accepts: 
	// - newEnd: Int - New ending number for this range (exlusive)
	// Returns: A copy of this range with that ending number
	until(newEnd) {
		return this.withEnd(newEnd)
	}

	withStep(newStep) {
		return new Range(this.start, this._end, this.isInclusive, newStep, this.makeBuilder)
	}
	// Accepts: 
	// - newStep: Number - A new increment to apply - Will be adjusted to correct direction
	// Returns: A copy of this range where each iteration moves by 'newStep' amount
	by(newStep) {
		return this.withStep(newStep)
	}
}