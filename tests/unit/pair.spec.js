import { Pair } from '@/classes/tale/struct/Pair'

describe('Pair', () => {
	const p = new Pair(1, 2);

	test('first & second', () => {
		expect(p.first).toBe(1);
		expect(p.second).toBe(2);
	})

	test('reverse', () => {
		const r = p.reverse;

		expect(r.first).toBe(2);
		expect(r.second).toBe(1);
	})

	test('iteration', () => {
		const iter = p.iterator;
		expect(iter.next()).toBe(1);
		expect(iter.next()).toBe(2);
		expect(iter.hasNext).toBe(false);
	})

	test('map', () => {
		const p2 = p.map(i => i + 1);
		expect(p2.first).toBe(2);
		expect(p2.second).toBe(3);
	})

	test('find', () => {
		expect(p.find(i => i > 1).get).toBe(2);
		expect(p.find(i => i < 0).isEmpty).toBe(true);
	})

	test('withFirst & withSecond', () => {
		const p2 = p.withFirst(3);
		const p3 = p.withSecond(3);

		expect(p2.first).toBe(3);
		expect(p2.second).toBe(2);
		expect(p3.first).toBe(1);
		expect(p3.second).toBe(3);
	})

	test('mapFirst & mapSecond', () => {
		const p2 = p.mapFirst(i => i + 3);
		const p3 = p.mapSecond(i => i + 3);

		expect(p2.first).toBe(4);
		expect(p2.second).toBe(2);
		expect(p3.first).toBe(1);
		expect(p3.second).toBe(5);
	})

	test('toString', () => {
		expect(p.toString()).toBe('(1, 2)');
	})
})