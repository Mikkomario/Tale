import { Pair } from './Pair'
import { Left, Right } from './Either'

// A collection of collection-related functions (that require cyclic dependencies)

// Divides a collection into two collections, based on a function
// Accepts: 
// - coll: anything with .foreach - Collection to divide
// - divider: Any => Either - A function that divides its results into either left or right side group
// Returns a Pair where the first value is collected left results and second value is collected right results
export function divideWith(coll, divider) {
	// Result collection type depends from the origin collection
	const leftBuilder = coll.newBuilder()
	const rightBuilder = coll.newBuilder()
	// Separates the (mapped) values based on side
	coll.foreach(a => divider(a).match(l => leftBuilder.addOne(l), r => rightBuilder.addOne(r)))
	// Returns built collections
	return new Pair(leftBuilder.result(), rightBuilder.result())
}

// Divides the collection values into two collections, based on a function
// Accepts:
// - coll: anything with .foreach - Collection to divide
// - divider: Any => Boolean - Function that returns true or false
// Returns a pair where the first value is values where the function returned false 
// 		and the second value is values where the function returned true
export function divideBy(coll, divider) {
	return divideWith(coll, a => {
		if (divider(a))
			return Right(a)
		else
			return Left(a)
	})
}

// Pairs the items in the specified collection, so that they appear as consequtive pairs
// All items are present twice in the resulting collection, EXCEPT the first and the last item
//  - The first item will only be present as the first first value
//  - The last item will only be present as the last second value
// Returns: Coll[Pair[A, A]] where Coll is the type of builder used by the specified collection 
// 		and A is the type of item contained within that collection
export function paired(coll) {
	return coll.zipMap(coll.iterator.drop(1), (behind, forward) => new Pair(behind, forward))
}