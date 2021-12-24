import { RichDate } from '@/classes/tale/time/RichDate'
import { millis } from '@/classes/tale/time/Duration'
import { Wait } from '@/classes/tale/time/Wait'

describe('Wait', () => {
	test('Duration target', () => {
		const w = new Wait(millis(100))
		expect(w.target.isLeft).toBe(true)
		expect(w.target.value.toMillis).toBe(100)
	})

	test('normal wait use case', done => {
		const w = new Wait(millis(100))
		expect(w.isActive).toBe(false)
		const callTime = RichDate.now()
		w.then(() => {
			const waited = RichDate.now().minus(callTime).toMillis
			expect(waited > 50).toBe(true)
			expect(waited < 150).toBe(true)
			done()
		})
		expect(w.isActive).toBe(true)
		expect(w.remaining.toMillis > 50).toBe(true)
	})

	test('autostart', done => {
		Wait.start(millis(100)).then(() => done())
	})

	test('cancel', done => {
		const w = new Wait(millis(100))
		const callTime = RichDate.now()
		w.then(() => done(new Error('Wait completed although should have cancelled')))
			.catch(() => {
				const waited = RichDate.now().minus(callTime).toMillis
				expect(waited < 50).toBe(true)
				done()
			})
		expect(w.isActive).toBe(true)
		expect(w.cancel()).toBe(true)
	})
})