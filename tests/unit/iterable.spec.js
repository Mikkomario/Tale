import { Vector } from '@/classes/tale/struct/Vector'
import { Option, Some, None } from '@/classes/tale/struct/Option'
import { Range } from '@/classes/tale/struct/Range'
import { Dict } from '@/classes/tale/struct/Dict'
import { Pair } from '@/classes/tale/struct/Pair'
import { ArrayWrapper } from '@/classes/tale/struct/ArrayWrapper'

describe('Iterable', () => {
	const o = Some(1)
	const v = new Vector([1, 2, 3])
	const p = new Pair(1, 2)
	const d = new Dict({
		a: 1, 
		b: 2, 
		c: 3
	})
	const r = Range.from(1).to(5).by(2)
	const a = new ArrayWrapper([1, 2, 3])
	const o2 = Some(o)
	const v2 = new Vector([v, v])
	const p2 = new Pair(p, p.reverse)
	const a2 = new ArrayWrapper([v, v])

	function newIter() { return v.iterator }

	function positive(i) { return i > 0 }
	function negative(i) { return i < 0 }
	function one(i) { return i == 1 }

	function testArray(c, expected) {
		const arr = c.toArray
		expect(arr.length).toBe(expected.length)
		for (let i = 0; i < arr.length; i++) {
			expect(arr[i]).toBe(expected[i])
		}
	}
	function testMutate(c, mutate, expected, typeCondition = a => true) {
		const alt = mutate(c)
		const iter = alt.iterator
		expect(typeCondition(alt)).toBe(true)
		expect(iter.hasNext === undefined).toBe(false)
		for (let i = 0; i < expected.length; i++) {
			expect(iter.hasNext).toBe(true)
			expect(iter.next()).toBe(expected[i])
		}
		expect(iter.hasNext).toBe(false)
	}

	test('nonEmpty & isEmpty', () => {
		function testEmpty(c, expectEmpty = true) {
			expect(c.isEmpty).toBe(expectEmpty)
			expect(c.nonEmpty).toBe(!expectEmpty)
		}
		testEmpty(newIter(), false)
		testEmpty(None, true)
		testEmpty(o, false)
		testEmpty(v, false)
		testEmpty(d, false)
		testEmpty(p, false)
		testEmpty(r, false)
		testEmpty(a, false)
	})

	test('head', () => {
		function testHead(c, expected) { expect(c.head).toBe(expected) }
		testHead(newIter(), 1)
		testHead(o, 1)
		testHead(v, 1)
		testHead(p, 1)
		testHead(r, 1)
		testHead(a, 1)

		const dh = d.head
		expect(dh.first).toBe('a')
		expect(dh.second).toBe(1)
	})

	test('headOption', () => {
		function testHead(c, expected) {
			expected.match(
				a => expect(c.headOption.get).toBe(a), 
				() => expect(c.headOption.isEmpty).toBe(true))
		}
		testHead(None, None)
		testHead(o, Some(1))
		testHead(v, Some(1))
		testHead(p, Some(1))
		testHead(r, Some(1))
		testHead(a, Some(1))

		const dh = d.headOption
		expect(dh.isDefined).toBe(true)
		expect(dh.get.first).toBe('a')
		expect(dh.get.second).toBe(1)
	})

	test('tail', () => {
		function testTail(c, expected, typeCondition = a => true) {
			testMutate(c, a => a.tail, expected, typeCondition)
		}
		testTail(newIter(), [2, 3], a => a.hasNext !== undefined)
		testTail(None, [], a => a instanceof Option)
		testTail(o, [], a => a instanceof Option)
		testTail(v, [2, 3], a => a instanceof Vector)
		testTail(p, [2], a => a instanceof Vector)
		testTail(r, [3, 5], a => a instanceof Range)
		testTail(a, [2, 3], a => a instanceof Vector)
	})

	test('size', () => {
		function testSize(c, expected) {
			expect(c.size).toBe(expected)
		}
		testSize(newIter(), 3)
		testSize(None, 0)
		testSize(o, 1)
		testSize(v, 3)
		testSize(p, 2)
		testSize(d, 3)
		testSize(r, 3)
		testSize(a, 3)
	})

	test('toArray', () => {
		testArray(newIter(), [1, 2, 3])
		testArray(None, [])
		testArray(o, [1])
		testArray(v, [1, 2, 3])
		testArray(p, [1, 2])
		testArray(r, [1, 3, 5])
		testArray(a, [1, 2, 3])
	})

	test('flatten', () => {
		function testFlat(c, expected) {
			testArray(c.flatten, expected)
		}
		testFlat(newIter(), [1, 2, 3])
		testFlat(None, [])
		testFlat(o, [1])
		testFlat(o2, [1])
		testFlat(v, [1, 2, 3])
		testFlat(v2, [1, 2, 3, 1, 2, 3])
		testFlat(p, [1, 2])
		testFlat(p2, [1, 2, 2, 1])
		testFlat(d, ['a', 1, 'b', 2, 'c', 3])
		testFlat(a, [1, 2, 3])
		testFlat(a2, [1, 2, 3, 1, 2, 3])
	})

	test('foreach', () => {
		function testFor(c, expectedSum) {
			var sum = 0
			c.foreach(i => sum += i)
			expect(sum).toBe(expectedSum)
		}
		testFor(newIter(), 6)
		testFor(None, 0)
		testFor(o, 1)
		testFor(v, 6)
		testFor(p, 3)
		testFor(r, 9)
		testFor(a, 6)
	})

	test('exists', () => {
		function testEx(c, f, expected = true) {
			expect(c.exists(f)).toBe(expected)
		}

		testEx(newIter(), positive)
		testEx(newIter(), negative, false)
		testEx(newIter(), one)

		testEx(None, positive, false)
		testEx(None, negative, false)

		testEx(o, positive)
		testEx(o, negative, false)
		testEx(o, one)

		testEx(v, positive)
		testEx(v, negative, false)
		testEx(v, one)

		testEx(p, positive)
		testEx(p, negative, false)
		testEx(p, one)

		testEx(d, p => p.second > 1)
		testEx(d, p => p.first == 'z', false)

		testEx(r, positive)
		testEx(r, negative, false)
		testEx(r, one)

		testEx(a, positive)
		testEx(a, negative, false)
		testEx(a, one)
	})

	test('forall', () => {
		function testFor(c, f, expected = true) {
			expect(c.forall(f)).toBe(expected)
		}

		testFor(newIter(), positive)
		testFor(newIter(), negative, false)
		testFor(newIter(), one, false)

		testFor(None, positive)
		testFor(None, negative)

		testFor(o, positive)
		testFor(o, negative, false)

		testFor(v, positive)
		testFor(v, negative, false)
		testFor(v, one, false)

		testFor(p, positive)
		testFor(p, negative, false)
		testFor(p, one, false)

		testFor(d, p => p.second > 0)
		testFor(d, p => p.second == 1, false)

		testFor(r, positive)
		testFor(r, negative, false)
		testFor(r, one, false)

		testFor(a, positive)
		testFor(a, negative, false)
		testFor(a, one, false)
	})

	test('contains', () => {
		function testC(c, item = 1, expected = true) {
			expect(c.contains(item)).toBe(expected)
		}
		testC(newIter())
		testC(newIter(), -1, false)

		testC(None, 1, false)

		testC(o)
		testC(o, -1, false)

		testC(v)
		testC(v, -1, false)

		testC(p)
		testC(p, -1, false)

		testC(r)
		testC(r, -1, false)

		testC(a)
		testC(a, -1, false)
	})

	test('take', () => {
		function testTake(c, amount = 2, expectedSize = 2, typeCondition = a => true) {
			const taken = c.take(amount)
			expect(typeCondition(taken)).toBe(true)
			if (taken.size != undefined)
				expect(taken.size).toBe(expectedSize)
			else if (taken.length != undefined)
				expect(taken.length).toBe(expectedSize)
			else if (expectedSize > 0)
				expect(taken.isEmpty).toBe(false)
			else
				expect(taken.isEmpty).toBe(true)
		}
		testTake(None, 2, 0, a => a instanceof Option)
		testTake(o, 2, 1, a => a instanceof Option)
		testTake(o, 0, 0, a => a instanceof Option)
		testTake(v, 2, 2, a => a instanceof Vector)
		testTake(v, 0, 0, a => a instanceof Vector)
		testTake(v, 5, 3, a => a instanceof Vector)
		testTake(p, 2, 2, a => a instanceof Pair)
		testTake(p, 1, 1, a => a instanceof Vector)
		testTake(p, 5, 2, a => a instanceof Pair)
		testTake(d, 2, 2, a => a instanceof Dict)
		testTake(d, 0, 0, a => a instanceof Dict)
		testTake(d, 4, 3, a => a instanceof Dict)
		testTake(r, 2, 2, a => a instanceof Range)
		testTake(r, 3, 3, a => a instanceof Range)
		testTake(r, 0, 0, a => a instanceof Range)
		testTake(a, 2, 2, a => a instanceof Vector)
		testTake(a, 1, 1, a => a instanceof Vector)
	})

	test('drop', () => {
		function testDrop(c, amount, expected, typeCondition = a => true) {
			testMutate(c, a => a.drop(amount), expected, typeCondition)
		}
		testDrop(newIter(), 2, [3], a => a.hasNext != undefined)
		testDrop(None, 2, [], a => a instanceof Option)
		testDrop(o, 2, [], a => a instanceof Option)
		testDrop(v, 2, [3], a => a instanceof Vector)
		testDrop(p, 2, [], a => a instanceof Vector)
		testDrop(d, 3, [], a => a instanceof Dict)
		const dropped = a.drop(2)
		expect(dropped.size).toBe(1)
		const iter = dropped.iterator
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(3)
		expect(iter.hasNext).toBe(false)
		testDrop(a, 2, [3], a => a instanceof Vector)
	})

	test('filter & filterNot', () => {
		function testFilter(c, f, expected, reverse, typeCondition) {
			testMutate(c, a => a.filter(f), expected, typeCondition)
			testMutate(c, a => a.filterNot(f), reverse, typeCondition)
		}
		testFilter(None, one, [], [], a => a instanceof Option)
		testFilter(o, one, [1], [], a => a instanceof Option)
		testFilter(o, negative, [], [1])
		testFilter(v, one, [1], [2, 3], a => a instanceof Vector)
		testFilter(p, one, [1], [2], a => a instanceof Vector)
		testFilter(p, positive, [1, 2], [], a => (a instanceof Pair) || a.size === 0)
		// testFilter(r, positive, [1,3,5], [], a => Array.isArray(a))
		// testFilter(r, one, [1], [3,5], a => Array.isArray(a))
		testFilter(a, one, [1], [2, 3], a => a instanceof Vector)
	})

	test('minusOne', () => {
		function testMinus(c, a, expected, typeCondition = a => true) {
			testMutate(c, c => c.minusOne(a), expected, typeCondition)
		}
		testMinus(None, 1, [], a => a instanceof Option)
		testMinus(o, 1, [], a => a instanceof Option)
		testMinus(o, 2, [1], a => a instanceof Option)
		testMinus(v, 2, [1, 3], a => a instanceof Vector)
		testMinus(p, 1, [2], a => a instanceof Vector)
		// testMinus(r, 3, [1,5], a => Array.isArray(a))
		testMinus(a, 3, [1, 2], a => a instanceof Vector)
	})

	test('minus', () => {
		function testMinus(c, a, expected, typeCondition = a => true) {
			testMutate(c, c => c.minus(a), expected, typeCondition)
		}
		testMinus(None, 1, [], a => a instanceof Option)
		testMinus(None, None, [], a => a instanceof Option)
		testMinus(o, 1, [], a => a instanceof Option)
		testMinus(o, o, [], a => a instanceof Option)
		testMinus(v, 2, [1, 3], a => a instanceof Vector)
		testMinus(v, o, [2, 3], a => a instanceof Vector)
		testMinus(v, p, [3], a => a instanceof Vector)
		testMinus(p, o, [2], a => a instanceof Vector)
		testMinus(p, v, [], a => a instanceof Vector)
		// testMinus(r, v, [5], a => Array.isArray(a))
		testMinus(a, p, [3], a => a instanceof Vector)
	})

	test('map', () => {
		function testMap(c, expected, typeCondition = a => true) {
			testMutate(c, a => a.map(i => i * 2), expected, typeCondition)
		}
		testMap(newIter(), [2, 4, 6], a => a.hasNext != undefined)
		testMap(None, [], a => a instanceof Option)
		testMap(o, [2], a => a instanceof Option)
		testMap(v, [2, 4, 6], a => a instanceof Vector)
		testMap(p, [2, 4], a => a instanceof Pair)
		// testMap(r, [2,6,10], a => Array.isArray(a))
		testMap(a, [2, 4, 6], a => a instanceof Vector)
	})

	test('flatMap', () => {
		function testFlat(c, f, expected, typeCondition) {
			testMutate(c, a => a.flatMap(f), expected, typeCondition)
		}
		function mirror(a) { return new Vector([a, -a]) }
		function filtering(a) {
			if (a > 1)
				return Some(a)
			else
				return None
		}

		testFlat(newIter(), mirror, [1, -1, 2, -2, 3, -3], a => a.hasNext != undefined)
		testFlat(newIter(), filtering, [2, 3], a => a.hasNext != undefined)
		testFlat(None, mirror, [], a => a instanceof Option)
		// testFlat(o, mirror, [1,-1], a => Array.isArray(a)) - Can't test because array has no .iterator
		testFlat(o, filtering, [], a => a instanceof Option)
		testFlat(v, mirror, [1, -1, 2, -2, 3, -3], a => a instanceof Vector)
		testFlat(v, filtering, [2, 3], a => a instanceof Vector)
		testFlat(p, mirror, [1, -1, 2, -2], a => a instanceof Vector)
		testFlat(p, filtering, [2], a => a instanceof Vector)
		// testFlat(r, mirror, [1,-2,3,-3,5,-5], a => Array.isArray(a))
		// testFlat(r, filtering, [3,5], a => Array.isArray(a))
		testFlat(a, mirror, [1, -1, 2, -2, 3, -3], a => a instanceof Vector)
		testFlat(a, filtering, [2, 3], a => a instanceof Vector)
	})

	test('find', () => {
		function testFind(c, expectFound = true) {
			const res = c.find(one)
			if (expectFound) {
				expect(res.isDefined).toBe(true)
				expect(res.get).toBe(1)
			}
			else
				expect(res.isDefined).toBe(false)
		}
		testFind(newIter())
		testFind(None, false)
		testFind(o)
		testFind(v)
		testFind(p)
		testFind(d, false)
		testFind(r)
		testFind(a)
	})

	test('findMap', () => {
		function testMap(c, f, expected) {
			const res = c.findMap(f)
			Option.flat(expected).match(
				value => {
					expect(res.nonEmpty).toBe(true)
					expect(res.head).toBe(value)
				}, 
				() => expect(res.isEmpty).toBe(true))
		}
		const invertedBig = i => {
			if (i > 1)
				return Some(-i)
			else
				return None
		}
		const invertedNegative = i => {
			if (i < 0)
				return Some(-i)
			else
				return None
		}
		testMap(v, invertedBig, -2)
		testMap(v, invertedNegative, None)
		testMap(p, invertedBig, -2)
		testMap(p, invertedNegative, None)
		testMap(r, invertedBig, -3)
		testMap(r, invertedNegative, None)
		testMap(a, invertedBig, -2)
		testMap(a, invertedNegative, None)
	})

	test('zipMap', () => {
		function testZip(c1, c2, typeCondition = a => true) {
			const items1 = c1.toArray
			const items2 = c2.toArray
			const zipped = c1.zipMap(c2, (a, b) => new Pair(a, b))
			const expectedSize = Math.min(c1.size, c2.size)
			const zv = Array.isArray(zipped) ? new Vector(zipped) : zipped
			const zArr = Array.isArray(zipped) ? zipped : zipped.toArray

			expect(typeCondition(zipped)).toBe(true)
			expect(zv.size).toBe(expectedSize)

			for (let i = 0; i < expectedSize; i++) {
				const p = zArr[i]
				expect(p instanceof Pair).toBe(true)
				expect(p.first).toBe(items1[i])
				expect(p.second).toBe(items2[i])
			}
		}

		testZip(v, p, a => a instanceof Vector)
		testZip(p, p, a => a instanceof Pair)
		testZip(v, None, a => a instanceof Vector)
		testZip(v, o, a => a instanceof Vector)
		testZip(o, None, a => a instanceof Option)
		testZip(o, p, a => a instanceof Option)
		testZip(r, p, a => Array.isArray(a))
		testZip(a, v, a => a instanceof Vector)
	})
})