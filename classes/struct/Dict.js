import { Iterable, Builder, BuilderWrapper } from './Iterable'
import { IterableWithOption } from './IterableWithOption'
import { Option } from './Option'
import { Vector, VectorBuilder } from './Vector'
import { Pair } from './Pair'

function valueToPair(value) {
	if (value instanceof Pair)
		return value;
	else if (value instanceof Vector && value.nonEmpty)
		return new Pair(value.head, value.tail);
	else if (Array.isArray(value) && value.length > 0) {
		if (value.length === 2)
			return new Pair(value[0], value[1]);
		else
			return new Pair(value[0], new Vector(value.slice(1)));
	}
	else
		return new Pair(value, Vector.empty);
}

function valueToPairs(value) {
	if (value instanceof Vector && value.forall(a => a instanceof Pair))
		return value;
	else if (value instanceof Pair)
		return new Vector([value]);
	else if (value instanceof Map) {
		const buffer = [];
		value.forEach((k, v) => buffer.push(new Pair(k, v)));
		return new Vector(buffer);
	}
	else if (value instanceof Iterable)
		return value.mapWith(item => valueToPair(item), new VectorBuilder());
	else if (Array.isArray(value)) {
		if (value.length !== 2 || value.every(item => item instanceof Pair || item instanceof Vector || Array.isArray(item)))
			return new Vector(value).map(item => valueToPair(item));
		else
			return new Vector([new Pair(value[0], value[1])]);
	}
	else if (typeof value === 'object')
		return new Vector(Object.keys(value)).map(key => new Pair(key, value[key]));
	else
		return new Vector([new Pair(value, Vector.empty)]);
}

// Converts almost any value type to a json value
function valueToJson(value) {
	if (value === null || value === undefined)
		return 'null';
	if (value.toJson !== undefined)
		return value.toJson;
	else if (typeof value === 'number' || typeof value === 'boolean')
		return value.toString();
	else if (typeof value === 'string')
		return `"${value}"`;
	else if (value instanceof Vector)
		return `[${value.map(a => valueToJson(a)).mkString(', ')}]`;
	else if (Array.isArray(value))
		return `[${new Vector(value).map(a => valueToJson(a)).mkString(', ')}]`;
	else if (value instanceof Option)
		return value.match(v => valueToJson(v), () => 'null');
	else if (value instanceof Iterable)
		return `[${value.mapWith(a => valueToJson(a), new VectorBuilder()).mkString(', ')}]`;
	else if (typeof value === 'object')
		return `{${new Vector(Object.keys(value)).map(key => `"${key}": ${valueToJson(value[key])}`).mkString(', ')}}`
	else
		return `"${value.toString()}"`
}

// If the specified function takes multiple parameters, passes pairs in parts, otherwise passes them whole
function functionForPairs(f) {
	if (f.length > 1)
		return p => f(p.first, p.second);
	else
		return f;
}

// This class behaves like an immutable Map (would be named Map if not for conflicts with existing classes)
export class Dict extends IterableWithOption {
	// Constructor
	// Expects a vector of pairs
	// Also interprets following:
	// - Iterable or array of pairs
	// - a single Pair
	// - Object => Will be converted to key-value pairs
	// Other types are converted to some sort of key value pairs
	constructor(values = Vector.empty) {
		super();
		this._pairs = valueToPairs(values);
		this._keys = this._pairs.map(p => p.first);
	}

	// An empty map
	static empty = new Dict(Vector.empty);

	_dictOrVector(v) {
		// Returns either a Dict or a Vector, depending on the type of items within
		if (v.forall(a => a instanceof Pair))
			return new Dict(v);
		else
			return v;
	}

	// Implemented
	get iterator() { 
		const that = this
		return this._pairs.iteratorWith(() => that.newBuilder()); 
	}
	newBuilder() { return new BuilderWrapper(new VectorBuilder(), vector => this._dictOrVector(vector)) }
	newDictBuilder() { return new BuilderWrapper(new VectorBuilder(), vector => new Dict(vector)) }

	toString() { return this.toJson }
	find(f) { return new Option(this._find(functionForPairs(f))) }
	foreach(f) { return super.foreach(functionForPairs(f)) }
	forall(f) { return super.forall(functionForPairs(f)) }
	exists(f) { return super.exists(functionForPairs(f)) }
	filter(f, builder = this.newDictBuilder()) { return super.filter(functionForPairs(f), builder) }
	map(f, builder = this.newBuilder()) { return super.map(functionForPairs(f), builder) }
	flatMap(f, builder = this.newBuilder()) { return super.flatMap(functionForPairs(f), builder) }
	async asyncMap(f, builder = this.newBuilder()) { return await super.asyncMap(functionForPairs(f), builder) }
	get nonEmpty() { return this._pairs.nonEmpty }

	get head() { return this._pairs.head }
	get headOption() { return this._pairs.headOption }
	get size() { return this._pairs.size }
	get toJson() { return `{${this._pairs.map(p => `"${p.first}": ${valueToJson(p.second)}`).mkString(', ')}}` }
	get keys() { return this._keys; }
	get toVector() { return this._pairs; }
	get values() { return this._pairs.map(p => p.second) }
	get valuesIterator() { return this._pairs.iterator.map(pair => pair.second) }

	filterNot(f, builder = this.newBuilder()) { 
		const pairF = functionForPairs(f);
		return this.filter(a => !pairF(a), builder) 
	}
	// Only maps keys
	mapKeys(f) { return this.map(p => p.mapFirst(f)) }
	// Only maps values
	mapValues(f) { return this.map(p => p.mapSecond(f)) }

	// Returns true if this map contains specified key
	containsKey(key) { return this.keys.contains(key) }
	// Returns value for key (option)
	get(key) { return this._pairs.find(p => p.first === key).map(p => p.second) }
	// Returns value for key, throws if not found
	apply(key) { return this.get(key).match(v => v, () => throw new Error('No value for key: ' + key)) }
	// Gets the value for key as a vector. Used with multi maps. If this map didn't contain that key, returns an empty vector.
	getVector(key) {
		return this.get(key).match(value => {
			if (value instanceof Vector)
				return value;
			else if (value instanceof Iterable)
				return value.to(new VectorBuilder());
			else if (Array.isArray(value))
				return new Vector(value);
			else
				return new Vector([value]);
		}, () => Vector.empty)
	}

	// Creates a new dict with an item appended or overwritten
	// Expects key and value separately or just a pair or multiple pairs as the key
	plus(k, v) {
		if (v === undefined) {
			const newPairs = valueToPairs(k);
			const newKeys = newPairs.map(p => p.first);
			const remainingOldPairs = this._pairs.filterNot(p => newKeys.contains(p.first));
			return new Dict(remainingOldPairs.plus(newPairs));
		}
		else
			return new Dict(this._pairs.filterNot(p => p.first === k).plusOne(new Pair(k, v)));
	}
	// Copies this dict with the specified element or elements removed
	minus(key) { 
		const base = this.filterNot(p => p.first === key);
		if (base.size === this.size && key instanceof Iterable)
			return base.filterNot(p => key.exists(k => p.first === k));
		else
			return base;
	}
	// Adds the specified value to this dictionary without removing any old values (forms vector values)
	// Expects key and a value or a pair
	append(k, v) {
		if (v === undefined)
			return this.append(valueToPair(k));
		else
			return this.plus(k, this.getVector(k).plus(v));
	}
}

export class DictBuilder extends Builder {
	constructor() {
		super();
		this._buffer = new Map();
	}

	add(item) {
		// Item may consist of one or more pairs
		valueToPairs(item).foreach(p => this._buffer.set(p.first, p.second));
	}
	addOne(item) {
		// Expects the item to consist of a single pair
		const p = valueToPair(item);
		this._buffer.set(p.first, p.second);
	}
	result() {
		const newDict = new Dict(this._buffer);
		this._buffer = [];
		return newDict;
	}
}

export class MultiDictBuilder extends Builder {
	constructor() {
		super();
		this._buffer = new Map();
	}

	addOne(item) {
		const newPair = valueToPair(item);
		const key = newPair.first;
		const value = newPair.second;
		
		if (this._buffer.has(key))
			this._buffer.get(key).add(value);
		else {
			const newBuilder = new VectorBuilder();
			newBuilder.add(value);
			this._buffer.set(key, newBuilder);
		}
	}
	result() {
		const newDict = new Dict(this._buffer).mapValues(builder => builder.result());
		this._buffer = new Map();
		return newDict;
	}
}