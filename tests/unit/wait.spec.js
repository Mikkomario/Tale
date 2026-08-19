import { describe, test, expect } from 'vitest'
import { RichDate } from '@/classes/time/RichDate'
import { millis } from '@/classes/time/Duration'
import { Wait } from '@/classes/time/Wait'

describe('Wait', () => {
	test('Duration target', () => {
		const w = new Wait(millis(100))
		expect(w.target.isLeft).toBe(true)
		expect(w.target.value.toMillis).toBe(100)
	})

	test('normal wait use case', async () => {
		const w = new Wait(millis(100))
		expect(w.isActive).toBe(false)

		const callTime = RichDate.now()
		const result = w.then(() => {
			const waited = RichDate.now().minus(callTime).toMillis
			expect(waited > 50).toBe(true)
			expect(waited < 150).toBe(true)
		})

		expect(w.isActive).toBe(true)
		expect(w.remaining.toMillis > 50).toBe(true)

		await result
	})

	test('cancel', async () => {
		const w = new Wait(millis(100))

		const callTime = RichDate.now()
		const result = w.then(() => expect.unreachable('Wait completed although should have cancelled'))
			.catch(() => {
				const waited = RichDate.now().minus(callTime).toMillis
				expect(waited < 50).toBe(true)
			})

		expect(w.isActive).toBe(true)
		expect(w.cancel()).toBe(true)

		await result
	})
})