import { describe, test, expect } from 'vitest'
import { millis } from '@/classes/time/Duration'
import { Loop } from '@/classes/time/Loop'
import { Wait } from '@/classes/time/Wait'

describe('Loop', () => {
	test('start(), isRunning and stop()', done => {
		var calls = 0
		const l = new Loop(millis(30), () => { 
			calls += 1
			return true
		})

		expect(l.isRunning).toBe(false)
		l.start()
		expect(calls).toBe(0)
		expect(l.isRunning).toBe(true)
		
		Wait.start(millis(70)).then(() => {
			const c = calls
			expect(l.isRunning).toBe(true)
			l.stop()
			expect(l.isRunning).toBe(false)
			expect(c).toBe(2)
			const callsAtStop = calls

			Wait.start(millis(40)).then(() => {
				expect(calls).toBe(callsAtStop)
				done()
			})
		})
	})

	test('immediate start', () => {
		var calls = 0
		const l = new Loop(millis(100), () => calls += 1)
		l.start(true)
		expect(calls).toBe(1)
		l.stop()
	})

	test('conditional continuation', done => {
		var calls = 0
		const l = new Loop(millis(10), () => {
			calls += 1
			return calls < 3
		})
		l.start()
		Wait.start(millis(60)).then(() => {
			expect(calls).toBe(3)
			expect(l.isRunning).toBe(false)
			done()
		})
	})
})