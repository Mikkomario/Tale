import { Left, Right } from '@/classes/tale/struct/Either'

describe('Either', () => {
	const l = Left(1)
	const r = Right(2)

	test('value', () => {
		expect(l.value).toBe(1)
		expect(r.value).toBe(2)
	})

	test('isRight & isLeft', () => {
		expect(l.isRight).toBe(false)
		expect(r.isRight).toBe(true)
		expect(l.isLeft).toBe(true)
		expect(r.isLeft).toBe(false)
	})

	test('right & left', () => {
		expect(l.right.isDefined).toBe(false)
		expect(r.right.get).toBe(2)
		expect(l.left.get).toBe(1)
		expect(r.left.isDefined).toBe(false)
	})

	test('toPair', () => {
		const lp = l.toPair
		const rp = r.toPair
		expect(lp.first.get).toBe(1)
		expect(lp.second.isDefined).toBe(false)
		expect(rp.first.isDefined).toBe(false)
		expect(rp.second.get).toBe(2)
	})

	test('match', () => {
		var leftCalls = 0
		var rightCalls = 0
		l.match(left => leftCalls += left, right => rightCalls += right)
		expect(leftCalls).toBe(1)
		expect(rightCalls).toBe(0)
		r.match(left => leftCalls += left, right => rightCalls += right)
		expect(leftCalls).toBe(1)
		expect(rightCalls).toBe(2)
	})
})