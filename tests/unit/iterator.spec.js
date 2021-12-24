import { Iterator } from '@/classes/tale/struct/Iterator'
import { ArrayIterator } from '@/classes/tale/struct/ArrayIterator'
import { Vector } from '@/classes/tale/struct/Vector'

describe('Iterator', () => {
	const v = new Vector([1, 2, 3])

	test('EmptyIterator.hasNext', () => {
		expect(Iterator.empty.hasNext).toBe(false)
	})

	test('SingleItemIterator iteration', () => {
		const iter = Iterator.once(1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.hasNext).toBe(false)
	})

	test('InfiniteIterator iteration', () => {
		var i = 0
		const iter = Iterator.continually(() => {
			i = i + 1
			return i
		})
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(2)
		expect(iter.next()).toBe(3)
		expect(iter.hasNext).toBe(true)
	})

	test('functionalIterator iteration', () => {
		const iter = Iterator.iterate(1, i => i + 1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.next()).toBe(2)
		expect(iter.next()).toBe(3)
	})

	test('foreach', () => {
		var calls = 0
		Iterator.empty.foreach(() => calls += 1)
		expect(calls).toBe(0)
		Iterator.once(2).foreach(i => calls += i)
		expect(calls).toBe(2)

		v.iterator.foreach(i => calls += i)
		expect(calls).toBe(8)
	})

	test('toArray', () => {
		const arr1 = Iterator.empty.toArray
		const arr2 = Iterator.once(1).toArray
		const arr3 = v.iterator.toArray

		expect(arr1.length).toBe(0)
		expect(arr2.length).toBe(1)
		expect(arr2[0]).toBe(1)
		expect(arr3.length).toBe(3)
		expect(arr3[1]).toBe(2)
	})

	test('drop', () => {
		const iter = Iterator.once(1)
		expect(iter.hasNext).toBe(true)
		iter.drop(1)
		expect(iter.hasNext).toBe(false)
		iter.drop(1)
		expect(iter.hasNext).toBe(false)

		const iter2 = v.iterator
		expect(iter2.hasNext).toBe(true)
		iter2.drop(2)
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(3)
		expect(iter2.hasNext).toBe(false)
	})

	test('take', () => {
		const iter1 = Iterator.once(1).take(2)
		expect(iter1.hasNext).toBe(true)
		expect(iter1.next()).toBe(1)
		expect(iter1.hasNext).toBe(false)

		const iter2 = v.iterator.take(2)
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(1)
		expect(iter2.next()).toBe(2)
		expect(iter2.hasNext).toBe(false)

		const iter3 = Iterator.once(1).take(0)
		expect(iter3.hasNext).toBe(false)
	})

	test('map', () => {
		const iter = Iterator.once(1).map(i => i + 1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(2)
		expect(iter.hasNext).toBe(false)

		const iter2 = Iterator.empty.map(i => i + 1)
		expect(iter2.hasNext).toBe(false)

		const iter3 = v.iterator.map(i => -i)
		expect(iter3.hasNext).toBe(true)
		expect(iter3.next()).toBe(-1)
		expect(iter3.next()).toBe(-2)
		expect(iter3.next()).toBe(-3)
		expect(iter3.hasNext).toBe(false)
	})

	test('flatMap', () => {
		const iter = Iterator.once(1).flatMap(i => i + 1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(2)
		expect(iter.hasNext).toBe(false)

		const iter2 = v.iterator.flatMap(i => new Vector([i, -i]))
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(1)
		expect(iter2.next()).toBe(-1)
		expect(iter2.next()).toBe(2)
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(-2)
		expect(iter2.next()).toBe(3)
		expect(iter2.next()).toBe(-3)
		expect(iter2.hasNext).toBe(false)
	})

	test('filter', () => {
		const iter = Iterator.once(1).filter(i => i > 0)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.hasNext).toBe(false)

		const iter2 = Iterator.once(1).filter(i => i < 0)
		expect(iter2.hasNext).toBe(false)

		const iter3 = v.iterator.filter(i => i % 2 != 0)
		expect(iter3.hasNext).toBe(true)
		expect(iter3.next()).toBe(1)
		expect(iter3.hasNext).toBe(true)
		expect(iter3.next()).toBe(3)
		expect(iter3.hasNext).toBe(false)
	})

	test('filterNot', () => {
		const iter = Iterator.once(1).filterNot(i => i > 0)
		expect(iter.hasNext).toBe(false)

		const iter2 = Iterator.once(1).filterNot(i => i < 0)
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(1)
	})

	test('nextOption', () => {
		const iter = v.iterator
		expect(iter.nextOption().get).toBe(1)
		expect(iter.nextOption().get).toBe(2)
		expect(iter.nextOption().get).toBe(3)
		expect(iter.nextOption().isDefined).toBe(false)
	})

	test('find', () => {
		const iter = v.iterator
		expect(iter.find(i => i > 3).isDefined).toBe(false)

		const res = v.iterator.find(i => i == 3)
		expect(res.isDefined).toBe(true)
		expect(res.get).toBe(3)
	})

	test('ArrayIterator', () => {
		const arr = [1, 2, 3]
		const iter = new ArrayIterator(arr)

		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.next()).toBe(2)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(3)
		expect(iter.hasNext).toBe(false)

		arr.push(4)

		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(4)
	})
})