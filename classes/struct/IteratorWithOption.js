import { Iterator } from './Iterator'
import { Some, None } from './Option'

export class IteratorWithOption extends Iterator {
	nextOption() {
		if (this.hasNext)
			return Some(this.next())
		else
			return None
	}

	find(f) {
		while (this.hasNext) {
			const candidate = this.next()
			if (f(candidate))
				return Some(candidate)
		}
		return None
	}
}

// A separate subclass of iterator that supports functions that utilize the Option class
export class IteratorWithOptionWrapper extends IteratorWithOption {
	constructor(wrapped) {
		super()
		this._source = wrapped
	}

	get hasNext() { return this._source.hasNext }
	next() { return this._source.next() }
}