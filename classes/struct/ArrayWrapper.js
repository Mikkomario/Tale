import { ArrayIterator } from './ArrayIterator'
import { BuilderWrapper, ArrayBuilder } from './Iterable'
import { Some, None } from './Option'
import { Range } from './Range'
import { Seq } from './Seq'
import { Vector, VectorBuilder } from './Vector'
import { Left, Right } from './Either'

// Accepts an item that may be array or iterable
// Return Either Left: The items if singular or Right: The items as an array, if possible
function tryArray(items) {
	if (Array.isArray(items))
		return Right(items)
	// Converts undefined and null to an empty arrray
	else if (items === undefined || items === null)
		return Right([])
	else {
		const otherArray = items.toArray
		if (otherArray !== undefined)
			return Right(otherArray)
		else {
			const iter = items.iterator
			if (iter !== undefined)
				return Right(iter.toArray)
			else
				return Left(items)
		}
	}
}

// A MUTABLE array wrapper class with Iterable operations
export class ArrayWrapper extends Seq {
	// CONSTRUCTOR	---------------------------------

	// Creates a new ArrayWrapper by wrapping the specified array
	// Accepts: 
	// - array: [Any] - An array to wrap (default = new empty array)
	constructor(array = []) {
		super()
		this.array = array
	}


	// STATIC	-------------------------------------

	// Creates a new ArrayWrapper from one or more items
	// Accepts:
	// item: Any - An item to wrap. May be of type Array or Iterable, or any other type
	// 		- NonIterable / NonArray types are wrapped in an array
	// Returns: A new ArrayWrapper from that item or collection of items
	static flat(item) {
		return tryArray(item).match(
			item => new ArrayWrapper([item]), 
			array => new ArrayWrapper(array))
	}

	// Returns: A new ArrayWrapper builder instance
	static newBuilder() { return new BuilderWrapper(new ArrayBuilder(), array => new ArrayWrapper(array)) }


	// COMPUTED	------------------------------------

	// Returns: The length of this array (same as .size)
	get length() { return this.array.length }

	// Returns: A Vector based on the current state of this wrapper
	get toVector() { return new Vector(this.toArray) }


	// IMPLEMENTED	--------------------------------

	get iterator() { return new ArrayIterator(this.array) }
	newBuilder() { return new VectorBuilder() }

	get size() { return this.array.length }
	get toArray() { return [].concat(this.array) }

	get(index) { return this.array[index] }



	// OTHER 	------------------------------------

	// Appends one item at the end of this array
	addOne(item) { this.array.push(item) }
	// Appends one or more items at the end of this array
	add(items) {
		const iter = items.iterator
		if (iter !== undefined)
			iter.foreach(item => this.array.push(item))
		else if (Array.isArray(items))
			items.forEach(item => this.array.push(item))
		else
			this.array.push(items)
	}
	// Appends one item at the end of this array (alias for addOne(...))
	pushOne(item) { this.addOne(item) }
	// Appends one or more items at the end of this array (alias for add(...))
	push(items) { this.add(items) }

	// Adds one item to the beginning of this array
	prependOne(item) { this.array.unshift(item) }
	// Adds one or more items to the beginning of this array
	prepend(items) {
		tryArray(items).match(
			single => this.prependOne(single), 
			arr => {
				// console.log(`Prepending [${arr}] to ${this.toString()}`)
				if (arr.length > 0)
					this.array.unshift(...arr) 
				// console.log(`=> ${this.toString()}`)
			})
	}

	// Inserts an item to a specific location in this array
	// Accepts:
	// - item: Any - An item to insert
	// - index: Int - The index where that item is inserted to (default = 0)
	insertOne(item, index = 0) { this.array.splice(index, 0, item) }
	// Inserts one or more items to a specific location in this array
	// Accepts: 
	// - items: Any - An item to insert, or an array or a collection of items
	// - index: Int - Index where the first item will be inserted (default = 0)
	insert(items, index = 0) {
		tryArray(items).match(
			single => this.insertOne(items, index), 
			arr => this.array.splice(index, 0, ...arr))
	}

	// Removes and returns the last item from this array
	// NB: Throws if empty
	pop() {
		if (this.nonEmpty)
			return this.array.pop()
		else
			throw new Error('Called .pop() on an empty ArrayWrapper')
	}
	// Removes and returns the last item from this array, wrapped in Some
	// Returns None if this array is empty
	tryPop() {
		if (this.nonEmpty)
			return Some(this.array.pop())
		else
			return None
	}
	// Alias for .pop()
	popLast() { return this.pop() }
	// Alias for .tryPop()
	tryPopLast() { return this.tryPop() }
	
	// Removes and returns the first item from this array
	// NB: Throws if empty
	popFirst() { 
		if (this.nonEmpty)
			return this.array.shift()
		else
			throw new Error('Called .popFirst() on an empty ArrayWrapper')
	}
	// Removes and returns the first item from this array, wrapped in Some
	// Returns None if this array is empty
	tryPopFirst() {
		if (this.nonEmpty)
			return Some(this.array.shift())
		else
			return None
	}

	// Removes a specific index from this array
	// Accepts: 
	// - index: Int - Index to remove, must be a valid index
	// Returns: Item at the removed index
	popIndex(index) {
		return this.array.splice(index, 1)[0]
	}
	// Accepts: 
	// - index: Int - Index to remove
	// Returns: Item at the removed index, wrapped in Some(...). None if index was not valid.
	tryPopIndex(index) {
		if (index >= 0 && index < this.size)
			return Some(this.popIndex(index))
		else
			return None
	}

	// Removes all items from this array
	clear() { this.array.splice(0, this.array.length) }
	// Removes and returns all items from this array
	// The items are returned as a Vector
	popAll() {
		const result = this.toVector
		this.clear()
		return result
	}

	// Removes the first item from this array where the specified condition is met
	// Accepts:
	// - f: Any => Boolean - Returns true for the item to remove
	removeFirstWhere(f) {
		this.indexWhere(f).foreach(i => this.array.splice(i, 1))
	}
	// Removes all items from this array where the specified condition is met
	// Accepts:
	// - f: Any => Boolean - Returns true for the items to remove (tested for each item)
	removeWhere(f) {
		// Finds the first index to remove
		this.indexWhere(f).foreach(firstIndex => {
			// Next seeks for other indices after that one
			const rangeBuilder = new VectorBuilder()
			let openRange = Range.from(firstIndex)
			Range.from(firstIndex + 1).until(this.size).foreach(i => {
				// Case: Index should be removed => combines that index with previous indices, if possible
				if (f(this.get(i))) {
					// Case: May be combined => extends the previous removal range
					if (openRange.contains(i - 1))
						openRange = openRange.to(i)
					// Case: Can't be combined => starts a new removal range
					else {
						rangeBuilder.addOne(openRange)
						openRange = Range.from(i)
					}
				}
			})
			// Removes all found removal ranges
			rangeBuilder.addOne(openRange)
			rangeBuilder.result().reverseIterator.foreach(range => this.array.splice(range.start, range.length))
		})
	}

	// Removes a specific item from this array
	// NB: Uses == to compare between items
	// NB: Won't remove multiple instances of that item
	remove(item) { this.removeFirstWhere(a => a == item) }

	// Maps items in the specified range, updating the values in this array with the map results
	// Accepts: 
	// - range: Range - Targeted range within this array
	// - f: Any => Any - A function that returns a modified copy of an item
	// NB: Won't replace items where the modified copy is equal (==) to the original item
	modifyRange(range, f) {
		range.foreach(i => {
			const original = this.array[i]
			const modified = f(original)
			if (original != modified)
				this.array[i] = modified
		})
	}
	// Maps the items in this array, storing the modified copies in this array
	// Accepts: 
	// - f: Any => Any - A function that returns a modified copy of an item
	// NB: Won't replace items where the modified copy is equal (==) to the original item
	modify(f) { this.modifyRange(this.indices, f) }
}