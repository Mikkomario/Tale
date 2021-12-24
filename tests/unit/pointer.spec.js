import { Pointer } from '@/classes/tale/struct/Pointer'

describe('Pointer', () => {
	test('get and set value', () => {
		const p = new Pointer(1)
		expect(p.value).toBe(1)
		p.value = 2
		expect(p.value).toBe(2)
	})

	test('onChange', () => {
		const p = new Pointer(0)
		var tests = 0
		p.onChange(e => {
			expect(e.oldValue).toBe(tests)
			expect(e.newValue).toBe(tests + 1)
			tests += 1
		})
		expect(tests).toBe(0)
		p.value = 1
		expect(tests).toBe(1)
		p.value = 1
		expect(tests).toBe(1)
		p.value = 2
		expect(tests).toBe(2)
	})

	test('add & remove named listener', () => {
		const p = new Pointer(0)
		var tests = 0
		p.addNamedListener('test', e => {
			expect(e.oldValue).toBe(tests)
			expect(e.newValue).toBe(tests + 1)
			tests += 1
		})
		expect(tests).toBe(0)
		p.value = 1
		expect(tests).toBe(1)
		p.removeNamedListener('test')
		p.value = 2
		expect(tests).toBe(1)
	})

	test('addAndCallListener', () => {
		const p = new Pointer(1)
		var tests = 0
		function listen(e) {
			expect(e.oldValue).toBe(tests)
			expect(e.newValue).toBe(tests + 1)
			tests += 1
		}
		p.addAndCallListener(listen, 0, 'test')
		expect(tests).toBe(1)
		p.value = 2
		expect(tests).toBe(2)
		p.removeNamedListener('test')
		p.value = 3
		expect(tests).toBe(2)

		const p2 = new Pointer(0)
		tests = 0
		p2.addAndCallListener(listen, 0)
		expect(tests).toBe(0)
	})
})