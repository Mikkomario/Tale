import { Iterable } from './Iterable'

// A common abstract class for all iterators (have hasNext and next())
class IteratorLike extends Iterable {
	// ABSTRACT	------------------------------

	get hasNext() { throw new Error('.hasNext not implemented') }
	next() { throw new Error('.next() not implemented') }
	// It is also recommended to implement other methods, also
	// which can't be implented here due to cyclic references


	// IMPLEMENTED	-------------------------

	get iterator() { return this }

	// To support javascript iterator & iterable (return in [Symbol.iterator]())
	get symbol() {
		const that = this;
		return {
			next: function() {
				if (that.hasNext)
					return { value: that.next() };
				else
					return { done: true };
			}
		}
	}


	// OVERRIDES	-------------------------

	get nonEmpty() { return this.hasNext }
	get head() { return this.next() }

	// Calls the specified function for all items in this iterator
	foreach(f) {
		while (this.hasNext) {
			f(this.next());
		}
	}

	// Removes the next n items from this iterator
	drop(count) {
		var dropped = 0
		while (dropped < count && this.hasNext) {
			this.next()
			dropped += 1
		}
		return this
	}

	// Converts the remaining items in this iterator to another collection by using the specified builder
	// Expects parameter builder, which contains methods .addOne(item) and .result()
	to(builder) {
		this.foreach(item => builder.addOne(item));
		return builder.result();
	}
}

export class EmptyIterator extends IteratorLike {
	get hasNext() { return false }
	next() { throw new Error('Called next() on an empty iterator') }

	take() { return this }
	drop() { return this }

	map() { return this }
	flatMap() { return this }
	filter() { return this }
	filterNot() { return this }
}

export class SingleItemIterator extends IteratorLike {
	constructor(item) {
		super()
		this._item = item
		this._consumed = false
	}

	get hasNext() { return !this._consumed }
	next() { 
		this._consumed = true
		return this._item 
	}

	take(amount) {
		if (amount > 0)
			return this
		else {
			this._consumed = true
			return this
		}
	}
	drop(amount) {
		if (amount <= 0)
			return this
		else 
		{
			this._consumed = true
			return this
		}
	}
	map(f) {
		if (this.hasNext)
			return new SingleItemIterator(f(this._item))
		else
			return this
	}
	flatMap(f) {
		if (this.hasNext) {
			const mapped = f(this._item)
			const iter = mapped.iterator
			if (iter === undefined)
				return new SingleItemIterator(mapped)
			else
				return iter
		}
		else
			return this
	}
	filter(f) {
		if (this.hasNext && !f(this._item))
			return new EmptyIterator()
		else
			return this
	}
}

// Common class for all iterator wrappers
export class IteratorWrapper extends IteratorLike {
	// CONSTRUCTOR	------------------------

	constructor(source) {
		super()
		this._source = source
	}


	// IMPLEMENTED	-----------------------

	get hasNext() { return this._source.hasNext }
	next() { return this._source.next() }


	// OVERRIDES	-----------------------

	newBuilder() { return this._source.newBuilder() }

	map(f) { return this._source.map(f) }
	flatMap(f) { return this._source.flatMap(f) }
	filter(f) { return this._source.filter(f) }
}

class FlatMappingIterator extends IteratorWrapper {
	// CONSTRUCTOR	----------------------

	constructor(source, mapper) {
		super(source)
		this._map = mapper

		this._cachedIter = null
	}


	// COMPUTED	-------------------------

	// Acquires the next available iterator, if possible
	get _pollIter() {
		while ((this._cachedIter === null || !this._cachedIter.hasNext) && this._source.hasNext) {
			const mappedNext = this._map(this._source.next())
			const nextIter = mappedNext.iterator
			if (nextIter === undefined)
				this._cachedIter = new SingleItemIterator(mappedNext)
			else
				this._cachedIter = nextIter
		}
		return this._cachedIter
	} 


	// IMPLEMENTED	---------------------

	get hasNext() {
		const nextIter = this._pollIter
		return nextIter != null && nextIter.hasNext
	}
	next() { return this._pollIter.next() }

	map(f) { 
		return new FlatMappingIterator(this, i => new SingleItemIterator(f(i))) 
	}
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { 
		return new FlatMappingIterator(this, i => {
			if (f(i))
				return new SingleItemIterator(i)
			else
				return new EmptyIterator()
		})
	}
}

export class MappingIterator extends IteratorWrapper {
	// CONSTRUCTOR	---------------------------

	// Accepts: 
	// - source: Iterator - Iterator being mapped
	// - f: Any => Any - Mapping function to apply
	constructor(source, f) {
		super(source)
		this._map = f
	}

	// IMPLEMENTED	--------------------------

	next() { return this._map(this._source.next()) }

	map(f) { return new MappingIterator(this, f) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { 
		return this.flatMap(i => {
			if (f(i))
				return new SingleItemIterator(i)
			else
				return new EmptyIterator()
		}) 
	}
}

class SkippingIterator extends IteratorWrapper {
	constructor(source, takeCondition) {
		super(source)
		this._condition = takeCondition

		this._cached = null
	}

	get poll() {
		while (this._cached == null && this._source.hasNext) {
			const candidate = this._source.next()
			if (this._condition(candidate))
				this._cached = candidate
		}
		return this._cached
	}

	get hasNext() { return this.poll != null }
	next() {
		const result = this.poll
		this._cached = null
		return result
	}

	map(f) { return new MappingIterator(this, f) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { return new SkippingIterator(this, f) }
}

export class InfiniteIterator extends IteratorLike {
	constructor(getNext) {
		super()
		this._getNext = getNext
	}

	get hasNext() { return true }
	next() { return this._getNext() }

	map(f) { return new InfiniteIterator(() => f(this.next())) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { return new SkippingIterator(this, f) }
	drop() { return this }
}

// A type of infinite iterator that keeps transforming the last value
// Only calls the transformation function when next() is called
export class FunctionalIterator extends IteratorLike {
	// Accepts:
	// - start: Any - First value to return
	// - transform: Any => Any - Function that takes the last value and produces the next value
	constructor(start, transform) {
		super()
		this._start = start
		this._transform = transform
		this._last = start
		this._started = false
	}

	get hasNext() { return true }
	next() {
		if (this._started) {
			const nextVal = this._transform(this._last)
			this._last = nextVal
			return nextVal
		}
		else {
			this._started = true
			return this._start
		}
	}

	map(f) { return new MappingIterator(this, f) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { return new SkippingIterator(this, f) }
}

class LimitedLengthIterator extends IteratorWrapper {
	constructor(source, maxLength = 0) {
		super(source)
		this._remaining = maxLength
	}

	get hasNext() { return this._remaining > 0 && this._source.hasNext }
	next() {
		this._remaining -= 1
		return this._source.next()
	}

	take(amount) {
		if (this._remaining > amount)
			this._remaining = amount
		return this
	}
	map(f) { return new MappingIterator(this, f) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { return new SkippingIterator(this, f) }
}

// A common abstract class for all iterators (have hasNext and next())
export class Iterator extends IteratorLike {
	static empty = new EmptyIterator()

	static once(item) { return new SingleItemIterator(item) }
	static continually(generator) { return new InfiniteIterator(generator) }
	static iterate(start, transform) { return new FunctionalIterator(start, transform) }

	take(amount) { 
		if (amount <= 0)
			return new EmptyIterator()
		else
			return new LimitedLengthIterator(this, amount) 
	}
	map(f) { return new MappingIterator(this, f) }
	flatMap(f) { return new FlatMappingIterator(this, f) }
	filter(f) { return new SkippingIterator(this, f) }
	filterNot(f) { return this.filter(i => !f(i)) }
}