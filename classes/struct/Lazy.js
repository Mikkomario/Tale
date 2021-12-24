import { Some, None } from './Option'
import { StatefulPromise, Stateful } from '../async/StatefulPromise'

// A lazily initialized value container / wrapper
export class Lazy {
	// CONSTRUCTOR	--------------------------

	// Creates a new lazy instance
	// Accepts a function that produces the cached value
	constructor(generator) {
		this._generator = typeof generator === 'function' ? generator : () => generator;
		this._value = None
	}


	// STATIC	------------------------------

	// Wraps a function or a value in a lazy container
	// Flattens possibly lazy wrapping
	static flat(generator) {
		if (generator instanceof Lazy)
			return generator;
		else
			return new Lazy(generator);
	}

	// Creates a lazy container that uses a stateful promise
	static async(generator) {
		if (generator instanceof StatefulPromise)
			return new Lazy(() => generator);
		else if (generator instanceof Lazy)
			return generator.map(v => Stateful(v));
		else
			return new Lazy(() => Stateful(generator));
	}


	// COMPUTED	------------------------------

	// Initialized value of this lazy container
	get value() {
		return this._value.getOrElse(() => {
			const newValue = this._generator();
			this._value = Some(newValue);
			return newValue;
		});
	}

	// Generates and stores a new value
	get newValue() {
		if (this.isEmpty)
			return this.value;
		else {
			this.reset();
			return this.value;
		}
	}

	// The current value of this lazy container, 
	// which is None before initialization and Some afterwards
	get current() { return this._value }

	// Whether this container is yet to be initialized
	get isEmpty() { return this._value.isEmpty }
	// Whether this container is initialized
	get nonEmpty() { return this._value.nonEmpty }


	// OTHER	-----------------------------

	// Resets this lazy container, 
	// so that a new value will be generated on next value call
	reset() { this._value = None }

	// Acquires the current value, then resets this container
	pop() {
		const result = this.value
		this.reset()
		return result
	}
	// Acquires the current value, if one is cached, then resets this container
	popCurrent() {
		return this.current.map(result => {
			this.reset()
			return result;
		})
	}

	// Maps this lazy into another lazy
	// NB: Resulting lazy container will be dependent from this one
	map(f) { return new Lazy(() => f(this.value)) }
}