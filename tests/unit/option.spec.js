/*
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})

*/

import { Option, None, Some } from '@/classes/tale/struct/Option'

describe('Option', () => {
	const newEmpty = new Option(null);
	const newSome = new Option(1);

	// Testing value accessing
	test('Value access', () => {
		expect(newEmpty.value).toBe(null);
		expect(newSome.value).toBe(1);
	})

	// Testing empty and nonEmpty on new Option
	test('Empty is empty', () => {
		expect(newEmpty.isEmpty).toBe(true);
	})
	test('Some is not empty', () => {
		expect(newSome.nonEmpty).toBe(true);
	})

	// Testing none and some
	const some = Option.some(1);

	test('Some defines a value', () => {
		expect(some.nonEmpty).toBe(true);
	})
	test('None is empty', () => {
		expect(Option.none.isEmpty).toBe(true);
	})

	// Testing other functions
	test('Foreach calls on some', () => {
		let calls = 0;
		some.foreach(n => {
			calls += 1;
			expect(n).toBe(1);
		})
		expect(calls).toBe(1);
	})
	test("Foreach doesn't call on none", () => {
		let calls = 0;
		Option.none.foreach(a => calls += 1);
		expect(calls).toBe(0);
	})

	test('Forall for none', () => {
		expect(Option.none.forall(a => false)).toBe(true);
	})
	test('Forall for some', () => {
		expect(some.forall(i => i == 1)).toBe(true);
		expect(some.forall(i => i == 0)).toBe(false);
	})
	test('Exists for none', () => {
		expect(Option.none.exists(a => true)).toBe(false);
	})
	test('Exists for some', () => {
		expect(some.exists(i => i == 1)).toBe(true);
		expect(some.exists(i => i == 0)).toBe(false);
	})
	test('match', () => {
		let sum = 0;
		let emptyCalls = 0;

		const firstResult = some.match(i => { 
			sum += i;
			return true;
		}, () => {
			emptyCalls += 1;
			return false;
		});

		expect(firstResult).toBe(true);
		expect(sum).toBe(1);
		expect(emptyCalls).toBe(0);

		const secondResult = Option.none.match(a => {
			sum += 100;
			return true 
		}, () => {
			emptyCalls += 1;
			return false;
		});

		expect(secondResult).toBe(false);
		expect(sum).toBe(1);
		expect(emptyCalls).toBe(1);
	})

	// Testing Some and None
	test('Some', () => {
		const s = Some(1);

		expect(s.nonEmpty).toBe(true);
		expect(s.value).toBe(1);
	})
	test('None', () => {
		expect(None.isEmpty).toBe(true);
	})

	// Equality
	test('equals', () => {
		expect(newEmpty.equals(None)).toBe(true);
		expect(newSome.equals(Some(1))).toBe(true);
		expect(None.equals(Some(1))).toBe(false);
	})

	// Map
	test('map', () => {
		const someMap = some.map(i => i + 1);
		const noneMap = Option.none.map(i => i + 1);

		expect(someMap.nonEmpty).toBe(true);
		expect(someMap.value).toBe(2);
		expect(noneMap.isEmpty).toBe(true);
	})

	// IsDefined
	test('isDefined', () => {
		expect(newSome.isDefined).toBe(true);
		expect(newEmpty.isDefined).toBe(false);
	})

	// Flatten
	test('flatten', () => {
		expect(Some(Some(1)).flatten.value).toBe(1);
		expect(Some(1).flatten.value).toBe(1);
		expect(None.flatten.isEmpty).toBe(true);
	})

	// Flatmap
	test('flatMap', () => {
		expect(Some(1).flatMap(i => Some(i + 1)).value).toBe(2);
		expect(Some(1).flatMap(() => None).isEmpty).toBe(true);
		expect(None.flatMap(() => Some(1)).isEmpty).toBe(true);
	})

	// Option creation from boolean and string
	test('boolean option', () => {
		expect(false == null).toBe(false);
		expect(false === '').toBe(false);

		const o1 = new Option(false);
		const o2 = new Option(true);
		const o3 = Some(false);
		const o4 = Some(true);

		expect(o1.isDefined).toBe(true);
		expect(o2.isDefined).toBe(true);
		expect(o3.isDefined).toBe(true);
		expect(o4.isDefined).toBe(true);

		expect(o1.value).toBe(false);
		expect(o2.value).toBe(true);
		expect(o3.value).toBe(false);
		expect(o4.value).toBe(true);
	})

	test('for loop', () => {
		let calls = 0;
		for (const _ of newEmpty) {
			calls += 1;
		}
		expect(calls).toBe(0);
		for (const item of newSome) {
			expect(item).toBe(1);
			calls += 1;
		}
		expect(calls).toBe(1);
	})

	test('toArray', () => {
		const array = newSome.toArray;
		expect(array.length).toBe(1);
		expect(array[0]).toBe(1);
	})

	test('flat', () => {
		const o1 = Option.flat(1)
		const o2 = Option.flat(null)
		const o3 = Option.flat(o1)
		expect(o1.isDefined).toBe(true)
		expect(o1.value).toBe(1)
		expect(o2.isDefined).toBe(false)
		expect(o3.isDefined).toBe(true)
		expect(o3.value).toBe(1)
	})

	test('iterator', () => {
		const iter1 = Some(1).iterator
		expect(iter1.hasNext).toBe(true)
		expect(iter1.next()).toBe(1)
		expect(iter1.hasNext).toBe(false)

		expect(None.iterator.hasNext).toBe(false)
	})

	test('getOrElse', () => {
		expect(some.getOrElse(() => -1)).toBe(1)
		expect(None.getOrElse(() => -1)).toBe(-1)
		expect(None.getOrElse(-1)).toBe(-1)
	})

	test('orElse', () => {
		expect(some.orElse(() => Some(-1)).get).toBe(1)
		expect(None.orElse(some).get).toBe(1)
		expect(None.orElse(None).isDefined).toBe(false)
		expect(None.orElse(() => some).get).toBe(1)
		expect(None.orElse(() => -1).get).toBe(-1)
		expect(None.orElse(-1).get).toBe(-1)
	})
})