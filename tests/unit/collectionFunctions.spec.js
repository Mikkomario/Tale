import { divideWith, divideBy } from '@/classes/tale/struct/CollectionFunctions'
import { Vector } from '@/classes/tale/struct/Vector'
import { Left, Right } from '@/classes/tale/struct/Either'

describe('CollectionFunctions', () => {
	const v = new Vector([1, 2, 3, 4, 5])

	test('divideWith', () => {
		const result = divideWith(v, i => {
			if (i % 2 == 0)
				return Right(i / 2)
			else
				return Left(i * 2)
		})

		expect(result.first.size).toBe(3)
		expect(result.second.size).toBe(2)
		expect(result.first.head).toBe(2)
		expect(result.second.head).toBe(1)
		expect(result.first.get(2)).toBe(10)
		expect(result.second.get(1)).toBe(2)
	})

	test('divideBy', () => {
		const result = divideBy(v, i => i % 2 == 0)
		expect(result.first.size).toBe(3)
		expect(result.second.size).toBe(2)
		expect(result.first.head).toBe(1)
		expect(result.second.head).toBe(2)
	})
})