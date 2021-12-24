import { Range, RangeIterator } from '@/classes/tale/struct/Range'

describe('RangeIterator', () => {
	function newIter() { return new RangeIterator(1, 5, 2) }

	test('iteration', () => {
		const iter = newIter()
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(3)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(5)
		expect(iter.hasNext).toBe(false)
	})

	test('size', () => {
		const iter = newIter()
		expect(iter.size).toBe(3)

		const iter2 = newIter()
		iter2.next()
		expect(iter2.size).toBe(2)
	})

	test('take', () => {
		const iter = newIter().take(2)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(1)
		expect(iter.next()).toBe(3)
		expect(iter.hasNext).toBe(false)
	})

	test('drop', () => {
		const iter = newIter().drop(2)
		expect(iter.hasNext).toBe(true)
		expect(iter.next()).toBe(5)
		expect(iter.hasNext).toBe(false)
	})
})

describe('Range', () => {
	const r = Range.from(1).to(5).by(2)
	const r2 = Range.from(3).until(0)

	test('start, first & head', () => {
		expect(r.start).toBe(1)
		expect(r.first).toBe(1)
		expect(r.head).toBe(1)
		expect(r2.start).toBe(3)
		expect(r2.first).toBe(3)
		expect(r2.head).toBe(3)
	})

	test('end & last', () => {
		expect(r.last).toBe(5)
		expect(r2.last).toBe(1)
		expect(r.end).toBe(7)
		expect(r2.end).toBe(0)
	})

	test('min & max', () => {
		expect(r.min).toBe(1)
		expect(r2.min).toBe(1)
		expect(r.max).toBe(5)
		expect(r2.max).toBe(3)
	})

	test('isBackward & isForward', () => {
		expect(r.isBackward).toBe(false)
		expect(r.isForward).toBe(true)
		expect(r2.isBackward).toBe(true)
		expect(r2.isForward).toBe(false)
	})

	test('length & size', () => {
		expect(r.length).toBe(5)
		expect(r2.length).toBe(3)
		expect(r.size).toBe(3)
		expect(r2.size).toBe(3)
	})

	test('reverse', () => {
		const rev1 = r.reverse
		const rev2 = r2.reverse

		expect(rev1.start).toBe(5)
		expect(rev1.step).toBe(-2)
		expect(rev1.last).toBe(1)
		expect(rev1.isForward).toBe(false)

		expect(rev2.start).toBe(1)
		expect(rev2.step).toBe(1)
		expect(rev2.last).toBe(3)
		expect(rev2.isForward).toBe(true)
	})

	test('forward & backward', () => {
		const f1 = r.forward
		const f2 = r2.forward
		const b1 = r.backward
		const b2 = r2.backward

		expect(f1.first).toBe(1)
		expect(f1.last).toBe(5)
		expect(f2.first).toBe(1)
		expect(f2.last).toBe(3)
		expect(b1.first).toBe(5)
		expect(b1.last).toBe(1)
		expect(b2.first).toBe(3)
		expect(b2.last).toBe(1)
	})

	test('iteration', () => {
		const iter1 = r.iterator
		expect(iter1.hasNext).toBe(true)
		expect(iter1.next()).toBe(1)
		expect(iter1.next()).toBe(3)
		expect(iter1.next()).toBe(5)
		expect(iter1.hasNext).toBe(false)

		const iter2 = r2.iterator
		expect(iter2.hasNext).toBe(true)
		expect(iter2.next()).toBe(3)
		expect(iter2.next()).toBe(2)
		expect(iter2.next()).toBe(1)
		expect(iter2.hasNext).toBe(false)
	})

	test('isEmpty & nonEmpty', () => {
		expect(r.isEmpty).toBe(false)
		expect(r.nonEmpty).toBe(true)
		expect(Range.empty.isEmpty).toBe(true)
		expect(Range.empty.nonEmpty).toBe(false)
	})

	test('contains', () => {
		expect(r.contains(1)).toBe(true)
		expect(r.contains(2)).toBe(true)
		expect(r.contains(3.5)).toBe(true)
		expect(r.contains(5)).toBe(true)
		expect(r.contains(0)).toBe(false)
		expect(r.contains(5.1)).toBe(false)

		expect(r2.contains(2)).toBe(true)
		expect(r2.contains(1)).toBe(true)
		expect(r2.contains(-1)).toBe(false)
	})

	test('take', () => {
		const t1 = r.take(2)
		const t2 = r2.take(2)

		expect(t1.first).toBe(1)
		expect(t1.last).toBe(3)
		expect(t2.first).toBe(3)
		expect(t2.last).toBe(2)
		expect(r.take(0).isEmpty).toBe(true)
	})

	test('drop', () => {
		const d1 = r.drop(1)
		const d2 = r2.drop(1)

		expect(d1.first).toBe(3)
		expect(d1.last).toBe(5)
		expect(d2.first).toBe(2)
		expect(d2.last).toBe(1)
		expect(r.drop(3).isEmpty).toBe(true)
	})
})