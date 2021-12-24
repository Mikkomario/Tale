import { IteratorWithOption } from './IteratorWithOption'
import { Iterable, Builder, BuilderWrapper, ArrayBuilder } from './Iterable'
import { Option } from './Option'
import { Seq } from './Seq'

function defaultCompare(a, b) {
	if (a === undefined || a === null) {
		if (b === undefined || b === null)
			return 0
		else
			return -1
	}
	else if (b === undefined || b === null)
		return 1
	else if (typeof a === 'number' && typeof b === 'number')
		return a - b
	else if (typeof a === 'string' && typeof b === 'string')
		return a.localeCompare(b)
	else if (typeof a.compareTo === 'function')
		return a.compareTo(b)
	else
		return a.toString().localeCompare(b.toString())
}

class IndexIterator extends IteratorWithOption {
	// CONSTRUCTOR	-------------------------------

	constructor(get, length = 0, start = 0, makeNewBuilder = () => new ArrayBuilder()) {
		super();
		this._source = get;
		this._length = length;
		this._nextIndex = start;
		this._makeNewBuilder = makeNewBuilder
	}

	// IMPLEMENTED	--------------------------------

	get hasNext() { return this._nextIndex < this._length }
	next() { 
		const result = this._source(this._nextIndex);
		this._nextIndex += 1;
		return result;
	}


	// OVERRIDES	--------------------------------

	newBuilder() { this._makeNewBuilder() }

	drop(amount) {
		this._nextIndex += amount
		return this
	}
}

// An immutable list / indexed array of items
export class Vector extends Seq {
	// CONSTRUCTOR	---------------------------------

	// Creates a new Vector. Expects an array to wrap or an item to wrap in an array.
	constructor(array = []) {
		super();
		this._array = Array.isArray(array) ? array : [array];
		this._size = this._array.length;
	}


	// STATIC	-------------------------------------

	// An empty vector
	static empty = new Vector();

	// Wraps a single item in a vector
	static single(item) { return new Vector([item]) }
	// Converts iterable items to vectors
	// Wraps non-iterable items
	// Converts nulls and undefineds to empty vectors
	static flat(item) {
		if (item === null || item === undefined)
			return Vector.empty
		if (item instanceof Vector)
			return item
		else
			return new Option(item.iterator).match(
				iter => iter.to(new BuilderWrapper(new ArrayBuilder(), array => new Vector(array))), 
				() => new Vector(item))
	}


	// COMPUTED	--------------------------------------

	// Returns a copy of this Vector that has been sorted using the default comparison function
	get sorted() { return this.sortWith(defaultCompare) }

	// Returns a copy of this vector where each item is unique by comparison (==)
	get distinct() { return this.distinctWith((a, b) => a === b); }


	// IMPLEMENTED	----------------------------------

	get iterator() { 
		const that = this
		return new IndexIterator(i => that._array[i], this.size, 0, () => that.newBuilder()) 
	}
	iteratorWith(makeBuilder) {
		const that = this;
		function f(i) { return that.get(i); }
		if (makeBuilder === undefined)
			return new IndexIterator(f, this.size, 0, () => that.newBuilder())
		else
			return new IndexIterator(f, this.size, 0, makeBuilder)
	}
	newBuilder() { return new BuilderWrapper(new ArrayBuilder(), array => new Vector(array)) }

	// Retrieves an item at the specified index
	get(index) { return this._array[index]; }

	// Number of items in this vector
	get size() { return this._size }
	// The first item in this vector
	get head() { return this._array[0]; }
	get last() { return this._array[this.size - 1] }

	take(amount) {
		if (amount >= this.size)
			return this
		else if (amount <= 0)
			return Vector.empty
		else {
			const builder = new ArrayBuilder()
			this.forRange(a => builder.addOne(a), 0, amount)
			return new Vector(builder.result())
		}
	}


	// OTHER-----------------------------------

	// Accepts:
	// - f: (A, A) => Number - A comparison function that accepts two items (a, b) and returns 
	// 		- > 0 if a > b
	// 		- < 0 if a < 0
	// 		- 0 if a == b
	// Returns: A sorted copy of this Vector
	sortWith(f = defaultCompare) {
		return new Vector(this.toArray.sort(f))
	}
	// Accepts: 
	// - map: A => B - A function that maps values of this Vector to comparable items
	// - compare: (B, B) => Number - A comparison function to use for the mapped values (default = default comparison function)
	// Returns: A copy of this Vector that has been sorted by comparing the mapped values
	sortBy(map, compare = defaultCompare) {
		return this.sortWith((a, b) => compare(map(a), map(b)))
	}

	// Creates a new vector with n items appended, depending on the type of the specified parameter
	// Adding an Iterable item or an Array may add multiple items
	// Adding some other type adds exactly one item
	plus(item) {
		if (item instanceof Vector)
			return new Vector(this._array.concat(item._array));
		else if (item instanceof Iterable) {
			const newArray = this._array.slice();
			item.foreach(a => newArray.push(a));
			return new Vector(newArray);
		}
		else if (Array.isArray(item)) {
			return new Vector(this._array.concat(item));
		}
		else
			return this.plusOne(item);
	}
	// Creates a new vector with exactly one item appended, regardless of type
	plusOne(item) {
		const newArray = this._array.slice();
		newArray.push(item);
		return new Vector(newArray);
	}
	// Creates a new vector with exactly one item prepended, regardless of type
	prependOne(item) {
		const newArray = this._array.slice();
		newArray.unshift(item);
		return new Vector(newArray);
	}

	// Creates a copy of this vector that is at least 'targetSize' items long
	// Adds items from 'item' as long as needed
	// 'item' -parameter may be a function to produce new items. Otherwise it is considered a repeated item.
	padTo(targetSize, item) {
		if (this.size >= targetSize)
			return this
		else {
			const buffer = this.toArray
			if (typeof item === 'function') {
				for (let i = this.size; i <= targetSize; i++) {
					buffer.push(item())
				}
			}
			else {
				for (let i = this.size; i <= targetSize; i++) {
					buffer.push(item)
				}
			}
			return new Vector(buffer)
		}
	}

	// Removes items which are considered duplicates by the specified testing function
	// The specified function takes 2 items and returns true or false
	distinctWith(compare) { 
		const array = [];
		this.foreach(a => {
			if (!array.some(a2 => compare(a, a2)))
				array.push(a);
		})
		return new Vector(array);
	}

	// Removes items which map to a duplicate item when using the specified mapping function
	// Upon duplicate entries, preserves the first entry
	// Accepts:
	// - map: A => Any - A function that maps vector values to something else (comparable items)
	// Returns: A copy of this vector with only unique values (when comparing mapped values)
	distinctBy(map) {
		const result = []
		const mapValues = []
		this.foreach(a => {
			const mapped = map(a)
			if (!mapValues.some(v => v == mapped)) {
				result.push(a)
				mapValues.push(mapped)
			}
		})
		return new Vector(result)
	}
}

// A builder that exports vectors
export class VectorBuilder extends Builder {
	constructor() {
		super();
		this._array = [];
	}

	// Implemented
	addOne(item) { this._array.push(item); }
	result() {
		const r = new Vector(this._array);
		this._array = [];
		return r;
	}
}