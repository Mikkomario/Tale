// Abstract class
// Builders must implement addOne(...) and result()
export class Builder {
	addOne(item) { throw new Error('.addOne(...) is not implemented') }
	result() { throw new Error('.result() is not implemented') }

	// Adds possibly multiple items to this builder
	add(item) {
		if (item.foreach !== undefined)
			item.foreach(a => this.addOne(a));
		else if (Array.isArray(item))
			item.forEach(a => this.addOne(a));
		else
			this.addOne(item);
	}
}

// A simple builder class
// Builders have methods add(item) and result() which builds the complete item
export class ArrayBuilder extends Builder {
	constructor() {
		super();
		this._buffer = [];
	}

	addOne(item) {
		this._buffer.push(item);
	}
	result() {
		const r = this._buffer;
		this._buffer = [];
		return r;
	}
}

// Wraps a builder and maps the result
export class BuilderWrapper extends Builder {
	constructor(wrapped = new ArrayBuilder(), f = array => array) {
		super()
		this._wrapped = wrapped
		this._wrap = f
	}

	addOne(item) {
		this._wrapped.addOne(item)
	}
	result() {
		return this._wrap(this._wrapped.result())
	}
}

// A common abstract class for all items that can be iterated
export class Iterable {
	// ABSTRACT	-------------------------------
	
	get iterator() { throw new Error('.iterator() is not implemented') }


	// IMPLETED	-------------------------------

	// Support for JS iteration
	[Symbol.iterator]() { return this.iterator.symbol }


	// COMPUTED	-------------------------------

	// Whether this iterable contains any items
	get nonEmpty() { return this.iterator.hasNext }
	// Whether this iterable is empty
	get isEmpty() { return !this.nonEmpty }

	// The first item in this iterable
	get head() { return this.iterator.next() }
	get tail() { return this.drop(1) }

	// Number of items in this collection
	get size() {
		let n = 0
		this.iterator.foreach(() => n += 1)
		return n
	}

	// An array with the contents of this iterable item
	get toArray() {
		const array = [];
		this.foreach(a => array.push(a));
		return array;
	}

	get flatten() { return this.flattenWith() }


	// OTHER----------------------------------

	// Creates a new default builder. Subclasses should override this.
	newBuilder() { return new ArrayBuilder() }

	// Checks whether these two iterables have equal content
	equals(other) {
		const otherIter = other.iterator
		if (otherIter === undefined)
			return false
		else {
			const iter = this.iterator
			while (iter.hasNext && otherIter.hasNext) {
				const a = iter.next()
				const b = otherIter.next()
				if (typeof a.equals === 'function') {
					if (!a.equals(b))
						return false
				}
				else if (a != b)
					return false
			}
			return iter.hasNext === otherIter.hasNext
		}
	}
	// Checks whether these two collections have equal mapped content
	// Accepts: 
	// - other: Iterable - Another collection
	// - f: A => Any - A function that accepts an item in this or other collection and maps it to a comparable value
	// Returns: Whether these collections have equal mapped content
	equalsBy(other, f) {
		const otherIter = other.iterator
		if (otherIter === undefined)
			return false
		else {
			const iter = this.iterator
			while (iter.hasNext && otherIter.hasNext) {
				const a = f(iter.next())
				const b = f(otherIter.next())
				if (typeof a.equals === 'function') {
					if (!a.equals(b))
						return false
				}
				else if (a != b)
					return false
			}
			return iter.hasNext === otherIter.hasNext
		}
	}

	// Calls the specified function for each item
	foreach(f) { this.iterator.foreach(f); }

	// Checks whether there exists a value in this collection 
	// that fulfils the specified condition
	// f should accept value and return true or false
	exists(f) {
		const iter = this.iterator;
		let found = false;

		while (!found && iter.hasNext) {
			found = f(iter.next());
		}

		return found;
	}
	// Checks whether the specified function returns true 
	// for all (0-1) value(s) of this option
	// f should accept value and return true or false
	forall(f) {
		return !this.exists(a => !f(a));
	}

	// Checks whether the value equals another
	contains(a) { return this.exists(v => v == a) }

	// Converts this collection to another form using the specified builder parameter
	// The builder should have methods .addOne(item) and .result()
	to(builder = this.newBuilder()) {
		return this.iterator.to(builder) 
	}

	// Takes the first n elements of this collection and creates a new collection out of them
	// Accepts:
	// - count: Int - Number of items to take / include in the result (maximum)
	// - builder: Builder - Builder that will create the resulting collection (default = default builder)
	// Returns: A new collection with the first 'count' items of this collection
	// The resulting collection may have smaller size than this one
	take(count, builder = this.newBuilder()) {
		const iter = this.iterator
		let taken = 0
		while (taken < count && iter.hasNext)
		{
			builder.addOne(iter.next())
			taken += 1
		}
		return builder.result()
	}
	// Creates a copy of this collection with the first n items removed
	drop(count, builder = this.newBuilder()) {
		if (count <= 0)
			return this
		else {
			this.iterator.drop(count).foreach(a => builder.addOne(a))
			return builder.result()
		}
	}

	// Only keeps items that are accepted by the specified filter function
	filter(f, builder = this.newBuilder()) {
		this.foreach(a => {
			if (f(a))
				builder.addOne(a);
		})
		return builder.result();
	}
	filterNot(f, builder = this.newBuilder()) { return this.filter(i => !f(i), builder) }

	// Accepts:
	// - item: Any - An item to remove
	// - builder: Builder - Builder for creating the resulting collection (default = this collection's default builder)
	// Returns: This collection without 'item' item (uses == to test)
	minusOne(item, builder = this.newBuilder()) { return this.filterNot(i => i == item) }
	// Accepts:
	// - item: Any - Item or items to remove
	// - builder: Builder - Builder for creating the resulting collection (default = this collection's default builder)
	// Returns: This collection without any of the items specfified
	// If 'item' contains function 'contains', uses that to test against this collection's items
	minus(item, builder = this.newBuilder()) {
		if (typeof item.contains === 'function')
			return this.filterNot(i => item.contains(i))
		else
			return this.minusOne(item, builder)
	}

	// Maps the contents of this iterable item into another iterable item
	map(f, builder = this.newBuilder()) {
		this.foreach(a => builder.addOne(f(a)));
		return builder.result();
	}
	// Maps the contents of this iterable item into another iterable item. Flattens in between.
	flatMap(f, builder = this.newBuilder()) {
		this.foreach(a => {
			const items = f(a);
			const iter = items.iterator
			if (iter !== undefined)
				iter.foreach(item => builder.addOne(item));
			else if (Array.isArray(items))
				items.forEach(item => builder.addOne(item));
			else
				builder.addOne(items);
		});
		return builder.result();
	}
	// Flattens Iterable[Iterable] to just Iterable
	flattenWith(builder = this.newBuilder()) { return this.flatMap(a => a, builder) }
	
	// Maps the items in this iterable asynchronously (using await)
	async asyncMap(f, builder = this.newBuilder()) {
		const iter = this.iterator;
		while (iter.hasNext) {
			// Wraps the result into a promise to make sure it can be awaited
			const mapResult = Promise.resolve(f(iter.next()));
			const waitResult = await mapResult;
			builder.addOne(waitResult);
		}
		return builder.result();
	}

	// Combines this collection with another
	// Please note that the resulting collection's size will be equal to the SMALLER collection's size
	// Accepts: 
	// - other: Iterable - Another collection (anything with .iterator)
	// - f: (Any, Any) => Any - A function that takes an item from this and 'other' and produces a merge result
	// 			- Default = make a two-item array from both
	// - builder: Builder - A builder that will combine the results into a collection (default = this collection's builder)
	// Returns: A collection of merge results 
	zipMap(other, f = (a, b) => [a, b], builder = this.newBuilder()) {
		const myIter = this.iterator
		const theirIter = other.iterator

		while (myIter.hasNext && theirIter.hasNext) {
			builder.addOne(f(myIter.next(), theirIter.next()))
		}

		return builder.result()
	}
	// Combines this collection with another
	// If the collections have different lengths, uses alternative, specialized functions
	// Accepts: 
	// - other: Iterable - Another collection (anything with .iterator)
	// - merge: (Any, Any) => Any - A function that takes an item from this and 'other' and produces a merge result
	// 			- Default = make a two-item array from both
	// - mapMe: Any => Any - A function that takes a remaining item from this and maps it to correct result type (default = identity)
	// - mapThem: Any => Any - A function that takes a remaining item from 'other' and maps it to correct result type (default = identity) 
	// - builder: Builder - A builder that will combine the results into a collection (default = this collection's builder)
	// Returns: A collection of merge results + mapped remaining items from 0-1 source collections
	mergeWith(other, merge = (a, b) => [a, b], mapMe = a => a, mapThem = b => b, builder = this.newBuilder()) {
		const myIter = this.iterator
		const theirIter = other.iterator

		while (myIter.hasNext && theirIter.hasNext) {
			builder.addOne(merge(myIter.next(), theirIter.next()))
		}
		while (myIter.hasNext) {
			builder.addOne(mapMe(myIter.next()))
		}
		while (theirIter.hasNext) {
			builder.addOne(mapThem(theirIter.next()))
		}

		return builder.result()
	}

	// Returns the first item that satisfies the specified search condition
	// An implementation of find which doesn't return an option (because of dependency problems)
	// This method is intended for subclass use, so that they can provide a finalized implementation
	_find(f) {
		const iter = this.iterator;
		let result = null;

		while (result == null && iter.hasNext) {
			const next = iter.next();
			if (f(next))
				result = next;
		}

		return result;
	}
}