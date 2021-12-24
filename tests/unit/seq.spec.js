import { Option, None } from '@/classes/tale/struct/Option'
import { Vector } from '@/classes/tale/struct/Vector'
import { ArrayWrapper } from '@/classes/tale/struct/ArrayWrapper'
import { Pair } from '@/classes/tale/struct/Pair'

describe('Seq', () => {
	const v = new Vector([1, 2, 3])
	const a = new ArrayWrapper([1, 2, 3])
	const p = new Pair(1, 2)

	test('indices', () => {
		function testIndices(c, expectedLast) {
			const indices = c.indices
			expect(indices.start).toBe(0)
			expect(indices.last).toBe(expectedLast)
			expect(indices.step).toBe(1)
		}

		testIndices(v, 2)
		testIndices(a, 2)
		testIndices(p, 1)
	})

	test('last', () => {
		expect(v.last).toBe(3)
		expect(a.last).toBe(3)
		expect(p.last).toBe(2)
	})

	test('lastOption', () => {
		expect(v.lastOption.get).toBe(3)
		expect(a.lastOption.get).toBe(3)
		expect(p.lastOption.get).toBe(2)
		expect(Vector.empty.lastOption.isEmpty).toBe(true)
	})

	test('reverseIterator', () => {
		function testReverse(c, expected) {
			const e = new ArrayWrapper(expected)
			const iter = c.reverseIterator

			expect(iter.hasNext).toBe(true)
			while (iter.hasNext) {
				expect(iter.next()).toBe(e.popFirst())
			}
			expect(e.isEmpty).toBe(true)
		}

		testReverse(v, [3, 2, 1])
		testReverse(a, [3, 2, 1])
		testReverse(p, [2, 1])
	})

	test('option', () => {
		function testOption(c, expectedHead = 1) {
			expect(c.option(0).get).toBe(expectedHead)
			expect(c.option(-1).isEmpty).toBe(true)
			expect(c.option(100).isEmpty).toBe(true)
		}

		testOption(v)
		testOption(a)
		testOption(p)
	})

	test('mkString', () => {
		function testStr(c, expected) {
			expect(c.mkString('-')).toBe(expected)
		}
		testStr(v, '1-2-3')
		testStr(a, '1-2-3')
		testStr(p, '1-2')
	})

	test('indexWhere', () => {
		function testIndex(c, expected) {
			expect(c.indexWhere(i => i > 1).get).toBe(expected)
			expect(c.indexWhere(i => i === 100).isEmpty).toBe(true)
		}

		testIndex(v, 1)
		testIndex(a, 1)
		testIndex(p, 1)
	})

	test('indexOf', () => {
		function testIndex(c, a, expected) {
			const res = c.indexOf(a)
			Option.flat(expected).match(
				e => {
					expect(res.isDefined).toBe(true)
					expect(res.get).toBe(expected)
				}
				, () => expect(res.isDefined).toBe(false))
		}

		testIndex(v, 1, 0)
		testIndex(v, 3, 2)
		testIndex(v, 4, None)
		testIndex(a, 1, 0)
		testIndex(a, 3, 2)
		testIndex(a, 0, None)
		testIndex(p, 1, 0)
		testIndex(p, 2, 1)
		testIndex(p, 3, None)
	})

	test('forRange', () => {
		function testRange(c, start, end, expected) {
			let sum = 0
			c.forRange(a => sum += a, start, end)
			expect(sum).toBe(expected)
		}

		testRange(v, 0, 2, 3)
		testRange(v, 1, 3, 5)
		testRange(a, 0, 2, 3)
		testRange(a, 1, 3, 5)
		testRange(p, 0, 2, 3)
		testRange(p, 1, 2, 2)
	})
})