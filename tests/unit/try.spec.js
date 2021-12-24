import { Some } from '@/classes/tale/struct/Option'
import { Try, Success, Failure } from '@/classes/tale/struct/Try.js'

describe('Try', () => {
	// Success and failure value acquisition
	test('Success', () => {
		const s = Success(1);

		expect(s.get).toBe(1);
		expect(s.success.equals(Some(1))).toBe(true);
		expect(s.failure.isEmpty).toBe(true);
	})
	test('Failure', () => {
		const f = Failure(new Error('TEST'));

		expect(f.failure.nonEmpty).toBe(true);
		expect(f.success.isEmpty).toBe(true);
	})
	// IsSuccess and IsFailure
	test('isSuccess and isFailure', () => {
		const s = Success(1);
		const f = Failure(new Error('TEST'));

		expect(s.isSuccess).toBe(true);
		expect(s.isFailure).toBe(false);
		expect(f.isSuccess).toBe(false);
		expect(f.isFailure).toBe(true);
	})
	// Match
	test('match', () => {
		let sum = 0;
		let errors = 0;

		Success(2).match(i => sum += i, e => errors += 1);

		expect(sum).toBe(2);
		expect(errors).toBe(0);

		Failure(new Error('TEST')).match(i => sum += i, e => errors += 1);

		expect(sum).toBe(2);
		expect(errors).toBe(1);
	})
	// Equals
	test('equals', () => {
		const s1 = Success(1);
		const s2 = Success(1);
		const s3 = Success(2);
		const f1 = Failure('A');
		const f2 = Failure('A');

		expect(s1.equals(s2)).toBe(true);
		expect(s1.equals(s3)).toBe(false);
		expect(f1.equals(f2)).toBe(true);
		expect(s1.equals(f1)).toBe(false);
	})
	test('apply', () => {
		const s1 = Try.apply(() => 1);
		const s2 = Try.apply(2);
		const f1 = Try.apply(() => throw new Error('test error'));

		expect(s1.isSuccess).toBe(true);
		expect(s1.get).toBe(1);
		expect(s2.isSuccess).toBe(true);
		expect(s2.get).toBe(2);
		expect(f1.isSuccess).toBe(false);
	})
})