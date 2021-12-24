import { IteratorWithOption } from './IteratorWithOption'
import { BuilderWrapper } from './Iterable'
import { Seq } from './Seq'
import { Vector, VectorBuilder } from './Vector'

class PairIterator extends IteratorWithOption {
	constructor(first, second, makeBuilder = () => new VectorBuilder()) {
		super();
		this._first = first;
		this._second = second;
		this._nextIndex = 0;
		this._makeBuilder = makeBuilder
	}

	// Implemented
	get hasNext() {
		return this._nextIndex < 2 
	}
	next() {
		const idx = this._nextIndex;
		this._nextIndex += 1;

		if (idx === 0)
			return this._first;
		else if (idx === 1)
			return this._second;
		else
			throw new Error('No more items to return in next() in PairIterator')
	}

	newBuilder() { return this._makeBuilder() }
}

// A simple class that consists of two values
export class Pair extends Seq {
	// CONSTRUCTOR	-----------------------------

	constructor(first, second) {
		super();
		this._first = first;
		this._second = second;
	}


	// COMPUTED	---------------------------------

	// The first value in this pair
	get first() { return this._first }
	// The second value in this pair
	get second() { return this._second }

	get reverse() { return new Pair(this.second, this.first) }


	// IMPLEMENTED	-----------------------------

	get iterator() { 
		const that = this
		return new PairIterator(this.first, this.second, () => that.newBuilder()); 
	}

	get(index) {
		if (index == 0)
			return this.first
		else if (index == 1)
			return this.second
		else
			throw new Error(index + ' is an invalid index in a Pair')
	}

	toString() { return `(${this.first}, ${this.second})` }


	// OVERRIDES	-----------------------------

	get size() { return 2 }

	newBuilder() { return new BuilderWrapper(new VectorBuilder(), vector => {
		if (vector.size === 2)
			return new Pair(vector.head, vector.get(1))
		else
			return vector
	}) }

	take(amount) {
		if (amount <= 0)
			return Vector.empty
		else if (amount >= 2)
			return this
		else
			return Vector.single(this.first)
	}
	foreach(f) {
		f(this.first)
		f(this.second)
	}
	map(f) { return new Pair(f(this.first), f(this.second)); }


	// OTHER	---------------------------------

	withFirst(first) { return new Pair(first, this.second) }
	withSecond(second) { return new Pair(this.first, second) }

	mapFirst(f) { return this.withFirst(f(this.first)); }
	mapSecond(f) { return this.withSecond(f(this.second)); }
}