import { Option, None, Some } from '../struct/Option'
import { Pair } from '../struct/Pair'
import { RichDate } from '../time/RichDate'

// A class that is used for interacting with a remote resource
// Caches and updates value when necessary
export class Resource {
	// CONSTRUCTOR	-------------------------

	// Creates a new resource
	// Accepts:
	// - request: (Option[RichDate], Option[Any]) => Promise[Any] - Function for retrieving a new resource version from the server
	// 		- Accepts last version cache time and last version, where both may be None
	//		- The returned promise should contain either the parsed item OR a Pair containing the parsed item and item cache time
	// - cacheDuration: Option[Duration] - How long items may be kept cached. None if infinitely (default)
	constructor(request, cacheDuration = None) {
		this._makeRequest = request
		this._cacheDuration = Option.flat(cacheDuration)

		this._cached = None
		this._cacheTime = None
		this._invalidated = false
	}


	// STATIC	----------------------------

	// Creates a new resource that maps to a specific node on the server
	// Accepts:
	// - api: Api - Api instance used when making requests to server
	// - path: String - Path to this resource on the server (after API's root path)
	// - parser: JSON => Any - Function for parsing the cached value from JSON
	// 		- May return either:
	//			- a) Pair[Any, RichDate] - where the parsed item is first and cache time second OR
	//			- b) Any - the cached item without a timestamp
	//		- Default = returns the json as is
	// - cacheDuration: Option[Duration] - How long items may be kept cached. None if infinitely (default)
	// - useIfModifiedSince: Boolean - Whether the If-Modified-Since -header should be applied when possible (default = false)
	static from(api, path, parser = json => json, cacheDuration = None, useIfModifiedSince = false) {
		return new Resource((cacheTime, cached) => {
			const requestTime = RichDate.now()
			return cached.filter(() => useIfModifiedSince).match(
				cached => api.getJsonIfModified(path, cacheTime)
					.then(result => result.match(
						json => {
							const parsed = parser(json)
							if (parsed instanceof Pair && parsed.second instanceof RichDate)
								return parsed
							else
								return new Pair(parsed, requestTime)
						}, 
						() => {
							// FIXME: This can randomly just fail
							return new Pair(cached, requestTime)
						})), 
				() => api.getJson(path).then(json => parser(json)))
			}, cacheDuration)
	}


	// COMPUTED	----------------------------

	// Cached value in this resource. None if no value is cached.
	get cached() { return this._cached }

	// Cached value in this resource, but only if it hasn't expired. 
	// None if there is no cached value or it is expired
	get validCached() {
		if (this._invalidated)
			return None
		else {
			const that = this
			return this._cached
				.filter(() => that._cacheDuration
					.forall(cacheDuration => that._cacheTime
						.exists(cacheTime => (cacheTime.plus(cacheDuration)).isInFuture)))
		}
	}

	// Value of this resource, as a promise
	// Updates this resource if necessary, otherwise provides the cached value
	get value() {
		const that = this;
		// Checks whether a cached resource may be used
		return this.validCached.match(
			cached => Promise.resolve(cached), 
			// If not, queries and stores a new version
			() => that._requestNew()
				// If the resource reading fails, may revert back to an expired version if one is available
				.catch(error => that._cached.match(
					cached => {
						console.log(error)
						return cached
					}, 
					() => throw error)))
	}
	// Updates the value in this cache
	set value(newValue) { this._store(newValue) }


	// OTHER	--------------------------

	// Modifies the cached contents of this resource
	// Accepts: 
	// f: Option[Any] => Option[Any] - A function that accepts the current cached value (as an option) 
	// 		and returns a modified version of that value (option)
	modify(f) {
		this._cached = Option.flat(f(this._cached))
	}

	// Invalidates this cache, so that upon next value request, a new value will be retrieved
	invalidate() { this._invalidated = true }

	// Reads a new value from the server, whether there exists a cached value or not
	// Returns a promise with the new value
	refresh() { this._requestNew() }

	// Clears the current contents from this resource
	clear() { 
		this._cached = None
		this._cacheTime = None
	}

	// Caches the specified item
	_store(item, time = RichDate.now()) {
		// console.log('Storing ' + JSON.stringify(item))
		this._invalidated = false
		this._cached = Some(item)
		this._cacheTime = Some(time)
		return item
	}

	// Requests a version of the item from the server and stores it
	_requestNew() {
		const that = this
		// Makes the request and acquires the parsed resource
		return this._makeRequest(this._cacheTime, this._cached)
			.then(result => {
				// Stores the resource and possibly time
				if (result instanceof Pair && result.second instanceof RichDate)
					return that._store(result.first, result.second)
				else
					return that._store(result)
			})
	}
}