import { Option, Some, None } from '../struct/Option'
import { Vector } from '../struct/Vector'
import { Pair } from '../struct/Pair'
import { Dict } from '../struct/Dict'
import { RichDate } from '../time/RichDate'

// A slot for storing a single value in the localStorage
export class StorageSlot {
	// CONSTRUCTOR	--------------------------------

	// Creates a new storage slot
	// Accepts:
	// - name: String - Name of this slot / property
	// - fromValue: Any => Any - A function that accepts a stored value and returns a parsed value
	// 		- NB: Stored value may be null or undefined
	// 		- Default = Read as is (not recommended)
	// - toValue: Any => Any - A function that accepts a value and converts it to a basic value
	// 		- Default = use .valueOf()
	constructor(name, fromValue = a => a, toValue = a => a.valueOf()) {
		this.name = name
		this.fromValue = fromValue
		this.toValue = toValue
		this._current = null
	}


	// COMPUTED	----------------------------------

	// Value stored in this slot
	get value() {
		if (this._current === null)
			this._current = this.fromValue(localStorage[this.name])
		return this._current
	}
	// Updates the value stored in this slot + the localStorage state
	set value(newValue) {
		this._current = newValue
		const storeValue = this.toValue(newValue)
		if (storeValue === null || storeValue === undefined)
			localStorage.removeItem(this.name)
		else
			localStorage[this.name] = storeValue
	}
}

// An interface for the LocalStorage that handles more advanced data types
export class DeviceStorage {
	// CONSTRUCTOR	--------------------------------

	// Accepts:
	// - allowStore: Boolean - Whether localStorage use is enabled (default = true)
	// - initialSlots: Vector[StorageSlot] - Slots to use for storing data (default = empty)
	constructor(allowStore = true, initialSlots = Vector.empty) {
		this.allowStore = allowStore
		this.slots = Vector.flat(initialSlots)
		this.nonStored = Dict.empty
	}


	// STATIC	-----------------------------------

	// Creates an enabled storage. Accepts slots to use
	static enabled(slots = Vector.empty) { return new DeviceStorage(true, slots) }
	// Creates a disabled storage (must be enabled separately). Accepts slots to use
	// Store should be disabled initially when user consent is required for store use
	static disabled(slots = Vector.empty) { return new DeviceStorage(false, slots) }


	// COMPUTED	-----------------------------------

	// Whether localStorage use is currently enabled
	get storingEnabled() { return this.allowStore }
	// Enables or disables localStorage use
	set storingEnabled(enabled) {
		if (enabled)
			this.enableStoring()
		else
			this.disableStoring()
	}


	// OTHER	----------------------------------

	// Reads a value for key, wrapped in an option
	// NB: If you expect the value itself to be an option, use option(key) instead
	get(key) {
		return this.nonStored.get(key).orElse(() => this.getSlot(key).map(slot => slot.value))
	}
	// Reads a value for key (not wrapped in an option) or None if not found
	apply(key) {
		return this.nonStored.get(key).getOrElse(() => this.getSlot(key).match(slot => slot.value, () => None))
	}
	// Reads a value for key (flat option). None if not found.
	option(key) {
		return this.get(key).flatten
	}
	// Reads a value for key (a vector). Empty vector if no value was found.
	vector(key) {
		return this.get(key).match(value => Vector.flat(value), () => Vector.empty)
	}
	// Updates a value for a key
	set(key, value) {
		if (this.allowStore)
			this.getSlot(key).match(slot => slot.value = value, () => this.nonStored = this.nonStored.plus(key, value))
		else
			this.nonStored = this.nonStored.plus(key, value)
	}

	// Whether this storage contains a registered slot with that name 
	containsSlot(name) { return this.slots.exists(s => s.name === name) }
	// Whether this storage contains a registered slot, or an nonStored value with that name
	contains(name) { return this.containsSlot(name) || this.nonStored.containsKey(name) }
	// Whether this storage contains a non-empty value for the specified name
	containsNonEmpty(name) { 
		return this.nonStored.get(name).orElse(() => this.getSlot(name).map(slot => slot.value))
			.exists(a => {
				const nonEmpty = a.nonEmpty
				if (nonEmpty === undefined)
					return a !== null && a !== undefined
				else
					return nonEmpty
			})
	}

	// Finds a registered slot for the specified name. None if not found.
	getSlot(name) { return this.slots.find(s => s.name === name) }

	// Enables localStorage use
	enableStoring() { 
		if (!this.allowStore) {
			this.allowStore = true
			// Updates slot values where possible and removes stored values from nonStored
			const duplicateKeys = this.nonStored.flatMap((key, value) => this.getSlot(key).match(
				slot => {
					slot.value = value
					return Some(key)
				}, 
				() => None))
			this.nonStored = this.nonStored.minus(duplicateKeys)
		}
	}
	// Disables localStorage use
	disableStoring() {
		if (this.allowStore) {
			this.allowStore = false
			// Caches all values so that they don't have to be looked from the storage
			this.nonStored = this.nonStored.plus(this.slots.map(slot => new Pair(slot.name, slot.value)))
		}
	}

	// Registers a new slot
	register(slot) {
		this.slots = this.slots.plus(slot)
	}
	// Registers a new slot
	// Accepts: 
	// name: String - Slot name
	// fromValue: Any => Any - A function that accepts a raw stored value and returns a processed value
	// toValue: Any => Any - A function that accepts a processed value and returns a raw value to store
	registerSlot(name, fromValue = a => a, toValue = a => a.valueOf()) {
		// Won't register duplicate slots
		if (this.slots.forall(slot => slot.name !== name))
			this.register(new StorageSlot(name, fromValue, toValue))
	}
	// Registers a new slot that contains option values
	registerOption(name) { 
		this.registerSlot(name, 
			a => new Option(a), 
			a => a.value) 
	}
	// Registers a new slot that contains vector values
	registerVector(name) { 
		this.registerSlot(name,  
			a => new Option(a).match(str => new Vector(JSON.parse(str)), () => Vector.empty), 
			a => JSON.stringify(a.toArray)) 
	}
	// Registers a new slot that contains dictionary values
	registerDict(name) { 
		this.registerSlot(name,  
			a => new Option(a).match(str => new Dict(JSON.parse(str)), () => Dict.empty), 
			a => a.toJson) 
	}
	// Registers a new slot that contains Option[RichDate] values
	registerDate(name) {
		this.registerSlot(name,  
			a => new Option(a).map(millis => RichDate.fromEpochMillis(millis)), 
			a => Option.flat(a).map(date => date.toEpochMillis).value)
	}
}