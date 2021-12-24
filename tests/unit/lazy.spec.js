import { Lazy } from '@/classes/tale/struct/Lazy'
import { Iterator } from '@/classes/tale/struct/Iterator'

describe('Lazy', () => {
	function newIter() { 
		return Iterator.iterate(1, i => i + 1)
	}
	function newLazy() {
		const iter = newIter()
		return new Lazy(() => iter.next())
	}

	test('value', () => {
		const source = newIter()
		const lazy1 = new Lazy(() => source.next())
		const lazy2 = new Lazy(() => source.next())
		expect(lazy2.value).toBe(1)
		expect(lazy2.value).toBe(1)
		expect(lazy1.value).toBe(2)
		expect(lazy1.value).toBe(2)
		expect(source.next()).toBe(3)

		const lazy3 = new Lazy(3)
		expect(lazy3.value).toBe(3)
	})

	test('newValue', () => {
		const lazy = newLazy()
		expect(lazy.newValue).toBe(1)
		expect(lazy.newValue).toBe(2)
		expect(lazy.newValue).toBe(3)
		expect(lazy.value).toBe(3)
	})

	test('current', () => {
		const lazy = newLazy()
		expect(lazy.current.isDefined).toBe(false)
		expect(lazy.value).toBe(1)
		expect(lazy.current.isDefined).toBe(true)
	})

	test('isEmpty & nonEmpty', () => {
		const lazy = newLazy()
		expect(lazy.isEmpty).toBe(true)
		expect(lazy.nonEmpty).toBe(false)
		expect(lazy.value).toBe(1)
		expect(lazy.isEmpty).toBe(false)
		expect(lazy.nonEmpty).toBe(true)
	})

	test('reset', () => {
		const lazy = newLazy()
		expect(lazy.value).toBe(1)
		lazy.reset()
		expect(lazy.isEmpty).toBe(true)
		expect(lazy.value).toBe(2)
	})

	test('pop', () => {
		const lazy = newLazy()
		expect(lazy.pop()).toBe(1)
		expect(lazy.pop()).toBe(2)
		expect(lazy.isEmpty).toBe(true)
	})

	test('popCurrent', () => {
		const lazy = newLazy()
		expect(lazy.popCurrent().isDefined).toBe(false)
		expect(lazy.isEmpty).toBe(true)
		expect(lazy.value).toBe(1)
		expect(lazy.popCurrent().get).toBe(1)
		expect(lazy.isEmpty).toBe(true)
	})

	test('map', () => {
		const origin = newLazy()
		const mapped = origin.map(i => -i)
		expect(origin.isEmpty).toBe(true)
		expect(mapped.isEmpty).toBe(true)
		expect(mapped.value).toBe(-1)
		expect(origin.nonEmpty).toBe(true)
		expect(origin.value).toBe(1)
		expect(mapped.newValue).toBe(-1)
		expect(origin.newValue).toBe(2)
		expect(mapped.value).toBe(-1)
		expect(mapped.newValue).toBe(-2)
	})

	test('flat', () => {
		const lazy1 = Lazy.flat(1)
		const lazy2 = Lazy.flat(lazy1)
		const lazy3 = Lazy.flat(() => 3)

		expect(lazy1.value).toBe(1)
		expect(lazy2.nonEmpty).toBe(true)
		expect(lazy2.value).toBe(1)
		expect(lazy3.value).toBe(3)
	})
})