import { Vector, VectorBuilder } from '@/classes/tale/struct/Vector'
import { ArrayBuilder } from '@/classes/tale/struct/Iterable'

describe('Vector', () => {
	const v = new Vector([1, 2, 3]);

	test('iterator', () => {
		const iter = v.iterator;

		expect(iter.hasNext).toBe(true);
		expect(iter.next()).toBe(1);
		expect(iter.hasNext).toBe(true);
		expect(iter.next()).toBe(2);
		expect(iter.next()).toBe(3);
		expect(iter.hasNext).toBe(false);
	})

	test('size', () => {
		expect(Vector.empty.size).toBe(0);
		expect(v.size).toBe(3);
	})

	test('isEmpty & nonEmpty', () => {
		expect(Vector.empty.isEmpty).toBe(true);
		expect(Vector.empty.nonEmpty).toBe(false);

		const v = new Vector(1);
		expect(v.isEmpty).toBe(false);
		expect(v.nonEmpty).toBe(true);
	})

	test('head', () => {
		expect(new Vector(1).head).toBe(1);
		expect(new Vector([2, 3, 4]).head).toBe(2);
	})

	test('tail', () => {
		const t = v.tail
		expect(t.size).toBe(2)
		expect(t.head).toBe(2)
	})

	test('get', () => {
		expect(v.get(0)).toBe(1);
		expect(v.get(1)).toBe(2);
		expect(v.get(2)).toBe(3);
	})

	test('option', () => {
		const v2 = new Vector([1, 2]);
		expect(v2.option(0).value).toBe(1);
		expect(v2.option(1).value).toBe(2);
		expect(v2.option(2).isDefined).toBe(false);
	})

	test('headOption', () => {
		expect(Vector.empty.headOption.isDefined).toBe(false);
		expect(new Vector(1).headOption.value).toBe(1);
		expect(new Vector([2, 3]).headOption.value).toBe(2);
	})

	test('last', () => {
		expect(v.last).toBe(3)
	})
	test('lastOption', () => {
		expect(Vector.empty.lastOption.isDefined).toBe(false)
		expect(v.lastOption.get).toBe(3)
	})

	test('foreach', () => {
		let sum = 0;
		v.foreach(i => sum += i);
		expect(sum).toBe(6);
	})

	test('forRange', () => {
		var sum = 0
		function add(i) { sum += i }
		function testSum(expected) {
			expect(sum).toBe(expected)
			sum = 0
		}

		v.forRange(add)
		testSum(6)

		v.forRange(add, 1)
		testSum(5)

		v.forRange(add, 0, 2)
		testSum(3)
	})

	test('forall', () => {
		expect(v.forall(i => i < 4)).toBe(true);
		expect(v.forall(i => i < 2)).toBe(false);
	})

	test('exists', () => {
		expect(v.exists(i => i < 2)).toBe(true);
		expect(v.exists(i => i > 2)).toBe(true);
		expect(v.exists(i => i > 3)).toBe(false);
	})

	test('contains', () => {
		expect(v.contains(1)).toBe(true);
		expect(v.contains(0)).toBe(false);
	})

	test('for loop', () => {
		let sum = 0;
		for (const i of v) {
			sum += i;
		}
		expect(sum).toBe(6);
	})

	test('toArray', () => {
		const array = v.toArray
		expect(array.length).toBe(3);
		expect(array[1]).toBe(2);
	})

	test('to', () => {
		const arr = v.to(new ArrayBuilder())
		expect(arr.length).toBe(3)
		expect(arr[1]).toBe(2)
	})

	test('drop', () => {
		const v2 = v.drop(2)
		expect(v2.size).toBe(1)
		expect(v2.head).toBe(3)
	})

	test('map', () => {
		const mapped = v.map(i => i + 1);
		expect(mapped.size).toBe(3);
		expect(mapped.head).toBe(2);
	})

	test('flatMap', () => {
		const mapped = v.flatMap(i => [i, i + 1]);
		expect(mapped.size).toBe(6);
		expect(mapped.head).toBe(1);
		expect(mapped.get(1)).toBe(2);
	})

	test('flattenWith', () => {
		const v2 = new Vector([[1, 2], [3, 4]])
		const flat = v2.flattenWith(new ArrayBuilder())

		expect(v2.size).toBe(2)
		expect(flat.length).toBe(4)
		expect(flat[0]).toBe(1)
		expect(flat[3]).toBe(4)
	})

	test('flatten', () => {
		const v1 = new Vector([[1, 2], [3, 4]])
		const v2 = v1.flatten
		expect(v1.size).toBe(2)
		expect(Array.isArray(v1.head)).toBe(true)
		expect(v2.size).toBe(4)
		expect(v2.head).toBe(1)
		expect(v2.get(3)).toBe(4)
	})

	test('filter', () => {
		const v2 = v.filter(i => i > 1);
		expect(v2.size).toBe(2);
		expect(v2.head).toBe(2);
		expect(v2.get(1)).toBe(3);
	})
	test('filterNot', () => {
		const v2 = v.filterNot(i => i > 1);
		expect(v2.size).toBe(1);
		expect(v2.head).toBe(1);
	})

	test('find', () => {
		const result = v.find(i => i > 1);
		expect(result.isDefined).toBe(true);
		expect(result.get).toBe(2);
	})

	test('distinct', () => {
		const v2 = new Vector([1, 2, 3, 3, 2, 1]).distinct
		expect(v2.size).toBe(3);
		expect(v2.head).toBe(1);
		expect(v2.get(1)).toBe(2);
		expect(v2.get(2)).toBe(3);
	})
	test('distinctBy', () => {
		const v2 = v.distinctBy((a, b) => (a % 2) == (b % 2));
		expect(v2.size).toBe(2);
		expect(v2.head).toBe(1);
		expect(v2.get(1)).toBe(2);
	})

	test('mkString', () => {
		expect(v.mkString()).toBe('123')
		expect(v.mkString('.')).toBe('1.2.3')
	})

	test('plus', () => {
		const v2 = v.plus(4);
		const v3 = v.plus(v);
		const v4 = v.plus([1, 2]);

		expect(v2.size).toBe(4);
		expect(v2.get(3)).toBe(4);
		expect(v3.size).toBe(6);
		expect(v3.get(4)).toBe(2);
		expect(v4.size).toBe(5);
		expect(v4.get(3)).toBe(1);
	})

	test('plusOne', () => {
		const v2 = new Vector([[5, 6]])
		const v3 = v2.plusOne(v)
		expect(v2.size).toBe(1)
		expect(v3.size).toBe(2)
		expect(v3.head[0]).toBe(5)
		expect(v3.get(1).last).toBe(3)
	})

	test('prependOne', () => {
		const v2 = v.prependOne(0)
		const v3 = v.prependOne(v)

		expect(v2.head).toBe(0)
		expect(v2.size).toBe(4)
		expect(v2.last).toBe(3)
		expect(v3.size).toBe(4)
		expect(v3.head.head).toBe(1)
	})

	test('VectorBuilder', () => {
		const builder = new VectorBuilder();
		builder.add(1);
		builder.add([2, 3]);
		const v2 = builder.result();
		const v3 = builder.result();

		expect(v2.size).toBe(3);
		expect(v2.get(2)).toBe(3);
		expect(v3.isEmpty).toBe(true);
	})

	test('single', () => {
		const v = Vector.single(3)
		const v2 = Vector.single([1, 2])
		expect(v.size).toBe(1)
		expect(v.head).toBe(3)
		expect(v2.size).toBe(1)
		expect(v2.head[1]).toBe(2)
	})

	test('flat', () => {
		const v2 = Vector.flat(3)
		const v3 = Vector.flat([1, 2])
		const v4 = Vector.flat(v)

		expect(v2.size).toBe(1)
		expect(v2.head).toBe(3)
		expect(v3.size).toBe(2)
		expect(v3.head).toBe(1)
		expect(v4.size).toBe(3)
		expect(v4.last).toBe(3)
	})

	test('indices', () => {
		const i = v.indices

		expect(i.first).toBe(0)
		expect(i.last).toBe(2)

		const iter = i.iterator

		expect(iter.next()).toBe(0)
		expect(iter.next()).toBe(1)
		expect(iter.next()).toBe(2)
		expect(iter.hasNext).toBe(false)
	})

	test('indexWhere', () => {
		const a = v.indexWhere(i => i > 1)
		expect(a.nonEmpty).toBe(true)
		expect(a.get).toBe(1)
		const b = v.indexWhere(i => i < 0)
		expect(b.nonEmpty).toBe(false)
	})

	test('indexOf', () => {
		const a = v.indexOf(3)
		expect(a.nonEmpty).toBe(true)
		expect(a.get).toBe(2)

		const b = v.indexOf(0)
		expect(b.nonEmpty).toBe(false)
	})
})