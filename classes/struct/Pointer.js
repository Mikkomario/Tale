import { None } from './Option'
import { Vector } from './Vector'
import { Dict } from './Dict'

// A simple structure that contains the old and the new pointer value
export class ChangeEvent {
	// CONSTRUCTOR	-----------------------

	// Creates a new change event
	// Accepts the old and the new value
	constructor(oldValue, newValue) {
		this._old = oldValue
		this._new = newValue
	}


	// COMPUTED	---------------------------

	// The previous pointer value
	get oldValue() { return this._old }
	// The new pointer value
	get newValue() { return this._new }
}

// A pointer that holds a single mutable value
// Supports events
export class Pointer {
	// CONSTRUCTOR	-----------------------

	constructor(initialValue = None) {
		this._value = initialValue
		// Listeners are stored as functions that accept change events
		this._listeners = Vector.empty
		this._namedListeners = Dict.empty
	}

	static flat(value) {
		if (value instanceof Pointer)
			return value
		else
			return new Pointer(value)
	}


	// COMPUTED	---------------------------

	// Current value in this pointer
	get value() { return this._value }
	// Updates the current value in this pointer
	// generates events
	set value(newValue) {
		const oldValue = this._value
		this._value = newValue
		// Only generates events if the value really changed 
		// and if there are listeners to inform
		if (newValue !== oldValue && (this._listeners.nonEmpty || this._namedListeners.nonEmpty)) {
			const event = new ChangeEvent(oldValue, newValue)
			this._listeners.foreach(listener => listener(event))
			this._namedListeners.valuesIterator.foreach(listener => listener(event))
		}
	}


	// OTHER	--------------------------

	// Adds a new change listener to this pointer
	onChange(listener) {
		this._listeners = this._listeners.plus(listener)
	}
	addNamedListener(name, listener) {
		this._namedListeners = this._namedListeners.plus(name, listener)
	}
	// Adds a new change listener to this pointer
	// Immediately calls the change listener
	// The second parameter determines the simulated old value
	addAndCallListener(listener, oldValue = None, listenerName = null) {
		if (listenerName == null)
			this.onChange(listener)
		else
			this.addNamedListener(listenerName, listener)

		if (this._value !== oldValue)
			listener(new ChangeEvent(oldValue, this._value))
	}
	removeNamedListener(name) {
		this._namedListeners = this._namedListeners.minus(name)
	}
}