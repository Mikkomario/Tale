import { Iterable } from './Iterable'
import { Some, None } from './Option'

// A subclass of Iterable that has access to Option
export class IterableWithOption extends Iterable {
	// COMPUTED	-----------------------------------

	// Returns: Some(head) if this collection is not empty. None otherwise.
	get headOption() {
		if (this.isEmpty)
			return None
		else
			return Some(this.head)
	}


	// OTHER -------------------------------------

	// Accepts: 
	// - f: Any => Boolean - A function that returns true for the targeted item
	// Returns: The first item accepted by the specified function. None if no item was accepted.
	find(f) {
		const iter = this.iterator
		while (iter.hasNext) {
			const item = iter.next()
			if (f(item))
				return Some(item)
		}
		return None
	}

	// Accepts: 
	// - f: Any => Option[Any] - A function that returns Some for an accepted item and None for unaccepted item
	// 		- NB: Also supports other Iterables than Option, they just need to contain .nonEmpty -property
	// Returns: The first function result that is not empty. None otherwise.
	findMap(f) {
		const iter = this.iterator
		while (iter.hasNext) {
			const item = f(iter.next())
			if (item.nonEmpty)
				return item
		}
		return None
	}
}