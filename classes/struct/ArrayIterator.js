import { IteratorWithOption } from './IteratorWithOption'

// A simple iterator for iterating array values
// The array may mutate during iteration
export class ArrayIterator extends IteratorWithOption {
	// CONSTRUCTOR	-----------------------------

	// Accepts: 
	// - source: [Any] - Array to read (default = empty)
	// - start: Int - First index to read (default = 0)
	constructor(source = [], start = 0) {
		super()
		this._source = source
		this._next = start
	}


	// IMPLEMENTED	-----------------------------

	get hasNext() { return this._next < this._source.length }
	next() { 
		const result = this._source[this._next]
		this._next += 1
		return result
	}

	drop(amount) {
		if (amount <= 0)
			return this
		else {
			this._next += amount
			return this
		}
	}
}