import { StatefulPromise, Stateful } from '@/classes/tale/async/StatefulPromise'
import { Failure, Success } from '@/classes/tale/struct/Try'

describe('StatefulPromise', () => {
	const testError = new Error('test');
	function delaySuccess(s) { return new Promise(resolve => setTimeout(() => resolve(s), 100)) }
	function delayFailure(error = testError) { return new Promise((undefined, reject) => setTimeout(() => reject(error), 100)) }

	// Delay methods
	test('success test method', () => {
		return expect(delaySuccess(1)).resolves.toBe(1);
	})
	test('failure test method', done => {
		delayFailure().then(() => expect('error').toMatch('no error'), () => done());
	})

	// Stateful
	test('Stateful success', done => {
		Stateful(delaySuccess(1)).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)));
	})
	test('Stateful failure', done => {
		Stateful(delayFailure()).finally(r => {
			expect(r.isFailure).toBe(true);
			done();
		})
	})
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
	test('state', done => {
		const promise = Stateful(delaySuccess(1));
		expect(promise.isCompleted).toBe(false);
		expect(promise.isPending).toBe(true);
		expect(promise.result.isEmpty).toBe(true);
		expect(promise.success.isEmpty).toBe(true);
		expect(promise.failure.isEmpty).toBe(true);
		expect(promise.isSuccess).toBe(false);
		expect(promise.isFailure).toBe(false);

		async function f1() {
			const result = await promise;
			expect(result).toBe(1);
			expect(promise.isCompleted).toBe(true);
			expect(promise.isPending).toBe(false);
			expect(promise.success.isDefined).toBe(true);
			expect(promise.failure.isDefined).toBe(false);
			expect(promise.isSuccess).toBe(true);
			expect(promise.isFailure).toBe(false);
			expect(promise.result.isDefined).toBe(true);

			done();
		}
		f1();
	})

	// Reject & resolve
	test('resolve', done => {
		StatefulPromise.resolve(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)))
	})
	test('reject', done => {
		StatefulPromise.reject(testError).finally(r => r.match(() => expect('success').toMatch('no success'), () => done()));
	})

	// Stateful variants
	test('Stateful function', done => {
		Stateful(() => 1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)))
	})
	test('Stateful value', done => {
		Stateful(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)));
	})

	// Stateful then
	test('thenWithState', done => {
		const first = Stateful(delaySuccess(1));
		const second = first.thenWithState(i => delaySuccess(i + 1));
		async function f1() {
			const res1 = await first;
			expect(res1).toBe(1);
			expect(second.isCompleted).toBe(false);

			second.finally(r => r.match(s => {
				expect(s).toBe(2);
				done();
			}, e => done(e)))
		}
		f1();
	})

	// Failure resolve handling
	test('Failure in then', done => {
		// When returning Failure in resolve, treats it as a failure
		new StatefulPromise(delaySuccess(Failure(testError))).then(() => expect('success').toMatch('Failure'), e => {
			expect(e instanceof Error).toBe(true);
			done();
		});
	})
	test('Failure in catch', done => {
		new StatefulPromise(delaySuccess(Failure(testError))).catch(e => {
			expect(e instanceof Error).toBe(true);
			done();
		})
	})
	test('Failure in finally', done => {
		new StatefulPromise(delaySuccess(Failure(testError))).finally(r => {
			expect(r.isFailure).toBe(true);
			done();
		});
	})
	test('Failure in Stateful', done => {
		Stateful(Failure(testError)).then(() => expect('success').toMatch('failure'), e => {
			expect(e instanceof Error).toBe(true);
			done();
		})
	})
	test('Success in Stateful', done => {
		Stateful(Success(1)).then(i => {
			expect(i).toBe(1);
			done();
		}, () => expect('failure').toMatch('success'))
	})

	// Maps
	test('map', done => {
		Stateful(1).map(r => { 
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
		}).finally(r => {
			expect(r.isSuccess).toBe(true);
			expect(r.get).toBe(5);
			done();
		})
	})
	test('mapSuccess', done => {
		Stateful(1).mapSuccess(i => {
			expect(i).toBe(1);
			return i + 1;
		}).mapSuccess(i => {
			expect(i).toBe(2);
			return Success(i + 1);
		}).mapSuccess(i => {
			expect(i).toBe(3);
			return Failure(testError);
		}).mapSuccess(() => {
			expect('success').toMatch('failure');
		}).finally(r => {
			expect(r.isFailure).toBe(true);
			done();
		})
	})
	test('mapFailure', done => {
		Stateful(Failure(testError)).mapFailure(e => {
			expect(e instanceof Error).toBe(true);
			throw e;
		}).mapFailure(e => {
			expect(e instanceof Error).toBe(true);
			return Failure(e);
		}).map(r => {
			expect(r.isFailure).toBe(true);
			return 1;
		}).mapFailure(() => {
			expect('faiure').toMatch('success');
			return 1;
		}).finally(r => {
			expect(r.isSuccess).toBe(true);
			done();
		})
	})
})