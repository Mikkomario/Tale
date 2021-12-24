import { ArrayWrapper } from '@/classes/tale/struct/ArrayWrapper'
import { Vector } from '@/classes/tale/struct/Vector'
import { Range } from '@/classes/tale/struct/Range'

describe('ArrayWrapper', () => {
	test('size', () => {
		expect(new ArrayWrapper([1, 2, 3]).size).toBe(3)
		expect(new ArrayWrapper().size).toBe(0)
		expect(new ArrayWrapper([1]).size).toBe(1)
	})

	test('clear', () => {
		const a = new ArrayWrapper([1, 2, 3])
		
		expect(a.size).toBe(3)
		a.clear()
		expect(a.size).toBe(0)
	})

	test('toArray', () => {
		const o = new ArrayWrapper([1, 2, 3])
		const copy = o.toArray

		expect(o.size).toBe(3)
		expect(copy.length).toBe(3)
		expect(copy[0]).toBe(1)
		expect(copy[2]).toBe(3)

		o.clear()

		expect(o.size).toBe(0)
		expect(copy.length).toBe(3)
		expect(copy[0]).toBe(1)
		expect(copy[2]).toBe(3)
	})

	test('toVector', () => {
		const o = new ArrayWrapper([1, 2, 3])
		const v = o.toVector

		expect(v.size).toBe(3)
		expect(v.head).toBe(1)
		expect(v.last).toBe(3)

		o.clear()

		expect(v.size).toBe(3)
		expect(v.head).toBe(1)
		expect(v.last).toBe(3)
	})

	test('Iterator', () => {
		const iter = new ArrayWrapper(['a', 'b']).iterator

		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe('a')
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe('b')
		expect(iter.hasNext).toBe(false)
	})

	test('get', () => {
		const a = new ArrayWrapper([1, 2, 3])

		expect(a.get(0)).toBe(1)
		expect(a.get(1)).toBe(2)
		expect(a.get(2)).toBe(3)
	})

	test('option', () => {
		const a = new ArrayWrapper([1, 2, 3])

		expect(a.option(-1).isEmpty).toBe(true)
		expect(a.option(0).get).toBe(1)
		expect(a.option(2).get).toBe(3)
		expect(a.option(3).isEmpty).toBe(true)
	})

	test('addOne', () => {
		const a = new ArrayWrapper()
		a.addOne(1)
		a.addOne(2)
		a.addOne([3, 4])
		a.addOne(new Vector([5]))

		expect(a.size).toBe(4)
		expect(a.head).toBe(1)
		expect(a.get(1)).toBe(2)
		expect(a.get(2).length).toBe(2)
		expect(a.get(3).size).toBe(1)
	})

	test('add', () => {
		const a = new ArrayWrapper()
		a.add(1)
		a.add(2)
		a.add([3, 4])
		a.add(new Vector([5]))

		expect(a.size).toBe(5)
		expect(a.head).toBe(1)
		expect(a.get(1)).toBe(2)
		expect(a.get(2)).toBe(3)
		expect(a.get(3)).toBe(4)
		expect(a.get(4)).toBe(5)
	})

	test('prependOne', () => {
		const a = new ArrayWrapper()
		a.prependOne(1)
		a.prependOne([2, 3])
		a.prependOne(new Vector(4))

		expect(a.size).toBe(3)
		expect(a.head.size).toBe(1)
		expect(a.get(1).length).toBe(2)
		expect(a.get(2)).toBe(1)
	})

	test('prepend', () => {
		const a = new ArrayWrapper()
		a.prepend(1)
		a.prepend([2, 3])
		a.prepend(new Vector(4))

		expect(a.size).toBe(4)
		expect(a.head).toBe(4)
		expect(a.get(1)).toBe(2)
		expect(a.get(2)).toBe(3)
		expect(a.get(3)).toBe(1)
	})

	test('insertOne', () => {
		const a = new ArrayWrapper([1, 2, 3])
		a.insertOne(4, 1)
		a.insertOne(5, 1)
		a.insertOne([6, 7])

		expect(a.size).toBe(6)
		expect(a.head.length).toBe(2)
		expect(a.get(1)).toBe(1)
		expect(a.get(2)).toBe(5)
		expect(a.get(3)).toBe(4)
		expect(a.get(4)).toBe(2)
	})

	test('insert', () => {
		const a = new ArrayWrapper([1, 2])
		a.insert(3, 1)
		a.insert([4, 5], 1)
		a.insert(new Vector(6))

		expect(a.size).toBe(6)
		expect(a.head).toBe(6)
		expect(a.get(1)).toBe(1)
		expect(a.get(2)).toBe(4)
		expect(a.get(3)).toBe(5)
		expect(a.get(4)).toBe(3)
		expect(a.get(5)).toBe(2)
	})

	test('pop', () => {
		const a = new ArrayWrapper([1, 2, 3])

		expect(a.pop()).toBe(3)
		expect(a.size).toBe(2)
		expect(a.pop()).toBe(2)
		expect(a.size).toBe(1)
		expect(a.head).toBe(1)
	})

	test('tryPop', () => {
		const a = new ArrayWrapper([1, 2])

		expect(a.tryPop().get).toBe(2)
		expect(a.tryPop().get).toBe(1)
		expect(a.tryPop().isEmpty).toBe(true)
	})

	test('popFirst', () => {
		const a = new ArrayWrapper([1, 2, 3])

		expect(a.popFirst()).toBe(1)
		expect(a.size).toBe(2)
		expect(a.popFirst()).toBe(2)
		expect(a.size).toBe(1)
		expect(a.head).toBe(3)
	})

	test('tryPopFirst', () => {
		const a = new ArrayWrapper([1, 2])

		expect(a.tryPopFirst().get).toBe(1)
		expect(a.tryPopFirst().get).toBe(2)
		expect(a.tryPopFirst().isEmpty).toBe(true)
	})

	test('popAll', () => {
		const a = new ArrayWrapper([1, 2])
		const v = a.popAll()

		expect(a.size).toBe(0)
		expect(v.size).toBe(2)
		expect(v.head).toBe(1)
		expect(v.last).toBe(2)
	})

	test('removeFirstWhere', () => {
		const a = new ArrayWrapper([1, 2, 3])
		a.removeFirstWhere(i => i > 1)

		expect(a.size).toBe(2)
		expect(a.head).toBe(1)
		expect(a.last).toBe(3)

		a.removeFirstWhere(i => i < 0)

		expect(a.size).toBe(2)
	})

	test('removeWhere', () => {
		const a = new ArrayWrapper([-1, 0, 1, 2, 3])
		a.removeWhere(i => i % 2 === 0)

		expect(a.size).toBe(3)
		expect(a.head).toBe(-1)
		expect(a.last).toBe(3)
		expect(a.get(1)).toBe(1)

		a.removeWhere(i => i > 100)

		expect(a.size).toBe(3)

		a.removeWhere(i => i > 0)

		expect(a.size).toBe(1)
		expect(a.head).toBe(-1)
	})

	test('remove', () => {
		const a = new ArrayWrapper([1, 2, 3])
		a.remove(2)

		expect(a.size).toBe(2)
		expect(a.head).toBe(1)
		expect(a.last).toBe(3)

		a.remove(-1)

		expect(a.size).toBe(2)
	})

	test('modifyRange', () => {
		const a = new ArrayWrapper([1, 2, 3, 4])
		a.modifyRange(Range.from(1).to(2), i => -i)

		expect(a.size).toBe(4)
		expect(a.head).toBe(1)
		expect(a.get(1)).toBe(-2)
		expect(a.get(2)).toBe(-3)
		expect(a.get(3)).toBe(4)
	})

	test('modify', () => {
		const a = new ArrayWrapper([1, 2, 3])
		a.modify(i => i - 1)

		expect(a.size).toBe(3)
		expect(a.head).toBe(0)
		expect(a.get(1)).toBe(1)
		expect(a.get(2)).toBe(2)
	})
})