import { IterableWithOption } from './IterableWithOption'
import { None, Some } from './Option'
import { Range } from './Range'

// An ABSTRACT class for index-based collections
export class Seq extends IterableWithOption {
	// ABSTRACT	-----------------------------

	// Retrieves an item at the specified index
	// Accepts: 
	// - index: Int - Index to retrieve
	// Returns: Item at that index
	// Throws if index is out of range
	get(index) { throw new Error('.get(Int) not implemented') }

	// NB: Remember to also implement size as a custom property


	// COMPUTED	-----------------------------

	// Returns: The indices of this collection as a Range: [0, 1, 2, ..., n-1, n] where n is the size of this collection - 1
	get indices() { 
		const that = this
		return new Range(0, this.size, false, 1, () => that.newBuilder()) 
	}

	// Returns the last item in this collection
	get last() { return this.get(this.size - 1) }
	// Returns the last item in this collection warpped in Some(...), or None if this collection is empty
	get lastOption() {
		if (this.nonEmpty)
			return Some(this.last);
		else
			return None;
	}

	// Returns: An iterator that goes through this collection in reverse order
	get reverseIterator() { return this.indices.reverseIterator.map(i => this.get(i)) }


	// IMPLEMENTED	------------------------

	get nonEmpty() { return this.size > 0 }
	get head() { return this.get(0) }

	foreach(f) { this.forRange(f) }
	toString() {
		return `[${this.mkString(', ')}]`
	}


	// OTHER	-------------------------------------

	// Retrieves an item at the specified index.
	// Accepts: 
	// - index: Int - Index to target (may be out of range)
	// Returns: Item at that index, wrapped in Some(...). None if that index was not valid for this collection.
	option(index) {
		if (index < 0 || index >= this.size)
			return None;
		else
			return Some(this.get(index));
	}

	// Constructs a string based on this collection
	// Accepts: 
	// - separator: String - A string placed between each item (default = '')
	// Returns: A string where each item is printed (using toString()) and a separator is placed between each item
	mkString(separator = '') {
		if (this.isEmpty)
			return '';
		else {
			let str = '';
			for (let i = 0; i < this.size - 1; i++) {
				str += this.get(i).toString();
				str += separator;
			}
			return str + this.last;
		}
	}

	// Accepts:
	// f: Any => Boolean - A function that returns true for the searched item
	// Returns: Index of the searched item in this collection, wrapped in Some. None if that item was not found.
	indexWhere(f) {
		for (let i = 0; i < this.size; i++) {
			const v = this.get(i)
			if (f(v))
				return Some(i)
		}
		return None
	}
	// Finds the index of an item using the comparison operator (==)
	// Accepts:
	// searched: Any - Item to search from this collection
	// Returns: Index of the searched item in this collection, wrapped in Some. None if that item was not found.
	indexOf(searched) { return this.indexWhere(a => a == searched) }

	// Performs the specified function for the specified index range
	// The index range must be in the range of valid indices
	// Accepts: 
	// - f: Any => () - Function that accepts individual values in that range
	// - start: Int - First index to include (default = 0)
	// - until: Int - First index to exclude (default = size)
	// NB: Start and until may be replaced with an instance of Range
	forRange(f, start = 0, until = this.size) {
		if (start instanceof Range)
			start.foreach(i => f(this.get(i)))
		else {
			for (let i = start; i < until; i++) {
				f(this.get(i))
			}
		}
	}
}