import { describe, test, expect } from 'vitest'
import { StatefulPromise, Stateful } from '@/classes/async/StatefulPromise'
import { Failure, Success } from '@/classes/struct/Try'

describe('StatefulPromise', () => {
	const testError = new Error('test');
	function delaySuccess(s) { return new Promise(resolve => setTimeout(() => resolve(s), 100)) }
	function delayFailure(error = testError) { return new Promise((undefined, reject) => setTimeout(() => reject(error), 100)) }

	// Delay methods
	test('success test method', () => {
		return expect(delaySuccess(1)).resolves.toBe(1);
	})
	test('failure test method', async () => {
		await expect(delayFailure()).rejects.toBeDefined();
	})

	// Stateful
	test('Stateful success', () => new Promise((resolve, reject) => {
		Stateful(delaySuccess(1)).finally(r => r.match(s => {
			expect(s).toBe(1);
			resolve();
		}, e => reject(e)));
	}))
	test('Stateful failure', () => new Promise(resolve => {
		Stateful(delayFailure()).finally(r => {
			expect(r.isFailure).toBe(true);
			resolve();
		})
	}))
	test('Stateful returns StatefulPromise', () => {
		const p = delaySuccess(1);
		expect(p instanceof Promise).toBe(true);
		expect(Stateful(p) instanceof StatefulPromise).toBe(true);
		expect(Stateful(Success(1)) instanceof StatefulPromise).toBe(true);
		expect(Stateful(Failure(testError)) instanceof StatefulPromise).toBe(true);
		expect(Stateful(1) instanceof StatefulPromise).toBe(true);
		expect(Stateful(() => 1) instanceof StatefulPromise).toBe(true);
	})

	// Result & completion
	test('state', async () => {
		const promise = Stateful(delaySuccess(1));
		expect(promise.isCompleted).toBe(false);
		expect(promise.isPending).toBe(true);
		expect(promise.result.isEmpty).toBe(true);
		expect(promise.success.isEmpty).toBe(true);
		expect(promise.failure.isEmpty).toBe(true);
		expect(promise.isSuccess).toBe(false);
		expect(promise.isFailure).toBe(false);

		const result = await promise;
		expect(result).toBe(1);
		expect(promise.isCompleted).toBe(true);
		expect(promise.isPending).toBe(false);
		expect(promise.success.isDefined).toBe(true);
		expect(promise.failure.isDefined).toBe(false);
		expect(promise.isSuccess).toBe(true);
		expect(promise.isFailure).toBe(false);
		expect(promise.result.isDefined).toBe(true);
	})

	// Reject & resolve
	test('resolve', () => new Promise((resolve, reject) => {
		StatefulPromise.resolve(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			resolve();
		}, e => reject(e)))
	}))
	test('reject', () => new Promise((resolve, reject) => {
		StatefulPromise.reject(testError).finally(r => r.match(
			() => reject(new Error('Rejected promise should not resolve')), 
			() => resolve()));
	}))

	// Stateful variants
	test('Stateful function', () => new Promise((resolve, reject) => {
		Stateful(() => 1).finally(r => r.match(
			s => {
				expect(s).toBe(1);
				resolve();
			}, 
			e => reject(e)))
	}))
	test('Stateful value', () => new Promise((resolve, reject) => {
		Stateful(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			resolve();
		}, e => reject(e)));
	}))

	// Stateful then
	test('thenWithState', async () => {
		const first = Stateful(delaySuccess(1));
		const second = first.thenWithState(i => delaySuccess(i + 1));
		
		const res1 = await first;
		expect(res1).toBe(1);
		expect(second.isCompleted).toBe(false);

		return new Promise((resolve, reject) => {
			second.finally(r => r.match(s => {
				expect(s).toBe(2);
				resolve();
			}, e => reject(e)))
		})
	})

	// Failure resolve handling
	test('Failure in then', async () => {
		// When returning Failure in resolve, treats it as a failure
		await expect(new StatefulPromise(delaySuccess(Failure(testError)))).rejects.toBeDefined();
	})
	test('Failure in catch', () => new Promise((resolve, reject) => {
		new StatefulPromise(delaySuccess(Failure(testError))).catch(e => {
			expect(e instanceof Error).toBe(true);
			resolve();
		})
		// FIXME: Doesn't resolve if successful
	}))
	test('Failure in finally', () => new Promise ((resolve, reject) => {
		new StatefulPromise(delaySuccess(Failure(testError))).finally(r => {
			expect(r.isFailure).toBe(true);
			resolve();
		});
	}))
	test('Failure in Stateful', async () => {
		await expect(Stateful(Failure(testError))).rejects.toBeDefined();
	})
	test('Success in Stateful', async () => {
		await expect(Stateful(Success(1))).resolves.toBe(1);
	})

	// Maps
	test('map', async () => {
		const mapped = Stateful(1).map(r => { 
			expect(r.isSuccess).toBe(true);
			expect(r.get).toBe(1);
			return r.map(i => i + 1) 
		}).map(r => {
			expect(r.isSuccess).toBe(true);
			expect(r.get).toBe(2);
			return Failure(testError);
		}).map(r => {
			expect(r.isFailure).toBe(true);
			throw new Error('test2');
		}).map(r => {
			expect(r.isFailure).toBe(true);
			expect(r.failure.get.message).toMatch('test2');
			return 5;
		});

		await expect(mapped).resolves.toBe(5);
	})
	test('mapSuccess', async () => {
		const mapped = Stateful(1).mapSuccess(i => {
			expect(i).toBe(1);
			return i + 1;
		}).mapSuccess(i => {
			expect(i).toBe(2);
			return Success(i + 1);
		}).mapSuccess(i => {
			expect(i).toBe(3);
			return Failure(testError);
		}).mapSuccess(() => {
			expect.unreachable('Should not be successful at this point');
		});

		await expect(mapped).rejects.toBeDefined();
	})
	test('mapFailure', async () => {
		const mapped = Stateful(Failure(testError)).mapFailure(e => {
			expect(e instanceof Error).toBe(true);
			throw e;
		}).mapFailure(e => {
			expect(e instanceof Error).toBe(true);
			return Failure(e);
		}).map(r => {
			expect(r.isFailure).toBe(true);
			return 1;
		}).mapFailure(() => {
			expect.unreachable('Should not be failed at this point')
			return 1;
		});

		await expect(mapped).resolves.toBe(1);
	})
})