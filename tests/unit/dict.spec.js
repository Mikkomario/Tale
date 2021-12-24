import { Dict } from '@/classes/tale/struct/Dict'
import { Vector } from '@/classes/tale/struct/Vector'
import { Pair } from '@/classes/tale/struct/Pair'

describe('Dict', () => {
	const d = new Dict(new Vector([new Pair('a', 1), new Pair('b', 2)]));

	test('size', () => { expect(d.size).toBe(2) })
	test('keys', () => {
		expect(d.keys.size).toBe(2);
		expect(d.keys.head).toBe('a')
	})
	test('values', () => {
		const values = d.values
		expect(values.size).toBe(2);
		expect(values.head).toBe(1);
	})
	test('get', () => {
		expect(d.get('a').get).toBe(1);
		expect(d.get('c').isEmpty).toBe(true);
	})
	test('apply', () => {
		expect(d.apply('a')).toBe(1);
		expect(d.apply('b')).toBe(2);
	})

	test('containsKey', () => {
		expect(d.containsKey('a')).toBe(true);
		expect(d.containsKey('x')).toBe(false);
	})

	test('constructors', () => {
		const d2 = new Dict([new Pair('a', 1), new Pair('b', 2)]);
		const d3 = new Dict(new Pair('a', 1));
		const d4 = new Dict(['a', 1]);
		const d5 = new Dict([['a', 1], ['b', 2]]);
		const d6 = new Dict({ a: 1, b: 2 })
		const d7 = new Dict('a');

		expect(d2.apply('a')).toBe(1);
		expect(d2.apply('b')).toBe(2);
		expect(d3.apply('a')).toBe(1);
		expect(d4.apply('a')).toBe(1);
		expect(d5.apply('a')).toBe(1);
		expect(d5.apply('b')).toBe(2);
		expect(d6.apply('a')).toBe(1);
		expect(d6.apply('b')).toBe(2);
		expect(d7.apply('a').isEmpty).toBe(true);
	})

	test('iterator', () => {
		const iter = d.iterator;
		const h = iter.next();

		expect(h instanceof Pair).toBe(true);
		expect(h.first).toBe('a');
		expect(h.second).toBe(1);

		const t = iter.next();

		expect(t instanceof Pair).toBe(true);
		expect(t.first).toBe('b');
		expect(t.second).toBe(2);

		expect(iter.hasNext).toBe(false);
	})

	test('toJson', () => {
		const d2 = new Dict({ a: new Vector([1, 2, 3]), b: 'STRING', c: { name: 'test', count: 2 }, d: true })
		expect(d2.toJson).toBe('{"a": [1, 2, 3], "b": "STRING", "c": {"name": "test", "count": 2}, "d": true}')
	})

	test('exists', () => {
		expect(d.exists(p => p.first == 'a')).toBe(true)
		expect(d.exists(p => p.second == 100)).toBe(false)
		expect(d.exists((_, v) => v == 2)).toBe(true)
		expect(d.exists((k, _) => k == 'x')).toBe(false)
	})
	test('find', () => {
		expect(d.find(p => p.first == 'a').get.second).toBe(1);
		expect(d.find((k, _) => k == 'a').get.second).toBe(1);
	})
	test('foreach', () => {
		let keys = ''
		let sum = 0;

		d.foreach(p => {
			keys += p.first;
			sum += p.second;
		})
		d.foreach((k, v) => {
			keys += k;
			sum += v;
		})

		expect(keys).toBe('abab');
		expect(sum).toBe(6);
	})

	test('head', () => {
		const h = d.head

		expect(h instanceof Pair).toBe(true);
		expect(h.first).toBe('a')
		expect(h.second).toBe(1);
	})

	test('filter & filterNot', () => {
		const d2 = d.filter((_, v) => v > 1);
		const d3 = d.filterNot((_, v) => v > 1);

		expect(d2.size).toBe(1);
		expect(d3.size).toBe(1);
		expect(d2.head.first).toBe('b');
		expect(d2.head.second).toBe(2);
		expect(d3.head.second).toBe(1);
	})

	test('map', () => {
		const d2 = d.map((k, v) => k + v);
		const d3 = d.map((k, v) => new Pair(k + v, v + 1));

		expect(d2 instanceof Vector).toBe(true);
		expect(d3 instanceof Dict).toBe(true);
		expect(d2.head).toBe('a1');
		expect(d3.apply('a1')).toBe(2);
	})

	test('mapKeys & mapValues', () => {
		const d2 = d.mapKeys(k => '_' + k);
		const d3 = d.mapValues(v => v + 1);

		expect(d2.containsKey('a')).toBe(false);
		expect(d2.apply('_a')).toBe(1);
		expect(d3.apply('a')).toBe(2);
	})

	test('getVector', () => {
		const d2 = new Dict(['a', new Vector([1, 2, 3])]);

		expect(d.getVector('a').size).toBe(1);
		expect(d2.getVector('a').size).toBe(3);
		expect(d.getVector('x').size).toBe(0);
	})

	test('plus', () => {
		const d2 = d.plus(new Pair('c', 3));
		const d3 = d.plus('c', 3);
		const d4 = d.plus('a', 3);
		const d5 = d.plus('a', new Vector([1, 3, 4]))
		const d6 = d.plus([['a', 3], ['c', 3]])

		expect(d2.size).toBe(3);
		expect(d3.size).toBe(3);
		expect(d4.size).toBe(2);
		expect(d5.size).toBe(2);
		expect(d6.size).toBe(3);

		expect(d2.apply('c')).toBe(3);
		expect(d3.apply('c')).toBe(3);
		expect(d4.apply('a')).toBe(3);
		expect(d5.apply('a').size).toBe(3);
		expect(d6.apply('a')).toBe(3);
		expect(d6.apply('c')).toBe(3);
	})

	test('append', () => {
		const d2 = d.append('a', [2, 3]);
		const d3 = d.append('c', [2, 3]);

		expect(d2.apply('a').size).toBe(3);
		expect(d2.apply('a').head).toBe(1);
		expect(d3.apply('c').size).toBe(2);
	})

	test('minus', () => {
		const d2 = d.minus('a');
		const d3 = d.minus('c');

		expect(d2.size).toBe(1);
		expect(d3.size).toBe(2);
		expect(d2.apply('b')).toBe(2);
		expect(d2.containsKey('a')).toBe(false)
	})
})