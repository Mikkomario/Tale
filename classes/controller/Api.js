import { Option, Some, None } from '../struct/Option'
import { Success, Failure } from '../struct/Try'
import { Lazy } from '../struct/Lazy'
import { Pointer } from '../struct/Pointer'
import { RichDate, Now } from '../time/RichDate'
import { AsyncResponse } from './AsyncResponse'

// Combines a string token with an expiration time
export class Token {
	// CONSTRUCTOR	-------------------------

	// Accepts 2 parameters:
	// - value: String - String representation of this token
	// - expires: Option[RichDate] - Time when this value expires (default = None)
	constructor(value, expires = None) {
		this._value = value;
		this._expires = Option.flat(expires);
	}


	// STATIC	-----------------------------

	// Creates a new token that expires at the specified time
	// Accepts:
	// - value: String - Text of this token
	// - expiration: RichDate - Time when this token expires
	static expiring(value, expiration) { return new Token(value, Some(expiration)) }
	// Creates a new token that lasts the specified duration
	// Accepts: 
	// - value: String - Text of this token
	// - duration: Duration - How long this token lasts
	static withDuration(value, duration) { return new Token(value, Some(Now + duration)) }
	// Creates a new token that doesn't expire
	// Accepts:
	// - value: String - Text of this token
	static persisting(value) { return new Token(value) }


	// COMPUTED	-----------------------------

	// Textual value of this token (String)
	get value() { return this._value }
	// Expiration time of this token (Option[RichDate])
	get expires() { return this._expires }

	// Whether this token is still valid (Boolean)
	get isValid() { 
		/*
		console.log('Testing expiration of token ' + this._value)
		this._expires.match(e => {
			console.log(e.toJson)
			console.log(e.isInFuture)
		}, () => console.log('No expiration time'))
		*/
		return this._expires.forall(e => e.isInFuture) 
	}
	// Whether this token has expired (Boolean)
	get isExpired() { return !this.isValid }


	// IMPLEMENTED	------------------------

	valueOf() { return this._value }
	equals(other) { return this._value === other._value } 
}

// Used for session management and authorizing requests to remote servers
export class Authorization 
{
	// CONSTRUCTOR	-------------------------

	// Creates a new authorization process
	// Accepts a function that returns the new token, or a promise of a new token
	constructor(getToken) {
		this._tokenCache = Lazy.async(getToken)
	}


	// STATIC	----------------------------

	// An authorization that always fails
	static failure = new Authorization(() => Promise.reject(new Error('Not authorized')))

	// Accepts a token string and wraps it into an authorization
	// Doesn't expect the token to expire
	static persistingToken(token) { return new Authorization(Token.persisting(token)) }

	// Combines two Authorizations so that another authorization is used when the first one fails
	static combo(primaryAuth, secondaryAuth) {
		return new Authorization(() => primaryAuth.token.catch(error => { 
			// console.log('Using secondary authorization')
			return secondaryAuth.token.catch(() => throw error) 
		}))
	}

	// Creates a new authorization that stores the token locally so that it can be reused
	// Accepts:
	// - storage: DeviceStorage - DeviceStorage instance that handles token storing
	// - tokenKey: String - Property name used when storing the token in device storage (default = sessionToken)
	// - expireTimeKey: Option[String] - Property name used when storing token expiration time to the DB. None if token doesn't expire (default)
	// - acquireNew: Authorization - Authorization used to acquire the stored token in the first place (default = failure)
	static stored(storage, tokenKey = 'sessionToken', expireTimeKey = None, acquireNew = Authorization.failure) {
		const timeKey = Option.flat(expireTimeKey)
		storage.registerSlot(tokenKey)
		timeKey.foreach(key => storage.registerDate(key))

		const storedAuth = new Authorization(() => storage.option(tokenKey).match(
			token => new Token(token, timeKey.flatMap(key => storage.option(key))), 
			() => Promise.reject(new Error('No authorization available'))))
		function getNewAuth() {
			return acquireNew.token.then(newToken => {
				// Stores the newly acquired token
				// console.log(`Storing ${newToken} as ${tokenKey}`)
				storage.set(tokenKey, Some(newToken.value))
				timeKey.foreach(key => storage.set(key, newToken.expires))

				return newToken
			})
		}

		return Authorization.combo(storedAuth, new Authorization(getNewAuth))
	}

	// Uses a token while it is valid, then switches to another form of authorization
	// Accepts: 
	// - token: String - A session (or refresh) token
	// - expiration: RichDate or Duration - Time when the token expires OR the duration of the token's lifetime
	// - backupAuthorization: Authorization - Authorization to use once the specified token has expired
	static temporaryToken(token, expiration, backupAuthorization = Authorization.failure) {
		const actualExpiration = expiration instanceof RichDate ? expiration : Now.plus(expiration)
		return new Authorization(() => {
			if (Now < actualExpiration)
				return Token.expiring(token, actualExpiration)
			else
				return backupAuthorization.token
		})
	}

	// Converts a fetch function into an authorization
	// Accepts:
	// - makeRequest: () => Promise[Response] - A function that will call fetch with suitable parameters
	// - responseParser: Response => Promise[Token] - A function that will read the token from a successful response
	static request(makeRequest, responseParser) {
		return new Authorization(() => makeRequest().then(response => {
			if (response.ok)
				return responseParser(response);
			else
				return response.text().catch(() => '').then(message => {
					if (!message || message.length === 0) {
						if (response.status === 401)
							throw new Error("Email and password don't match");
						else if (response.status >= 500)
							throw new Error('This service is not currently working correctly');
						else
							throw new Error('Failed to authenticate');
					}
					else
						throw new Error(message);
				})
		}))
	}

	// Converts a fetch function into an authorization
	// Expects the fetch response to contain the token as text (which may be wrapped in double quotes)
	// Accepts:
	// - makeRequest: () => Promise[Response] - see request
	// - tokenDuration: Option[Duration] - how long tokens will last. None if infinitely (default).
	static requestTokenString(makeRequest, tokenDuration = None) {
		const actualDuration = Option.flat(tokenDuration)
		return Authorization.request(makeRequest, response => {
			return response.text().then(key => new Token(key.replace(/"/g, ''), actualDuration.map(d => Now.plus(d))))
		})
	}

	// Swaps the specified basic authentication to a token
	// Expects server to respond with a token text or string
	// Accepts:
	// - User name or email address: String
	// - Password: String
	// - url: String - Whole url of the authentication end point
	// - tokenDuration: Option[Duration] - Token life time
	// - style: String - Style to request for the session (default = 'simple')
	static basic(user, password, url, tokenDuration = None, style = 'simple') {
		return Authorization.requestTokenString(() => fetch(url, { 
			headers: { 
				Authorization: 'Basic ' + window.btoa(unescape(encodeURIComponent(user + ':' + password))), 
				'X-Style': style
			}
		}), tokenDuration)
	}

	// Uses the specified refresh token authorization to acquire a session token
	// Expects server to respond with a token text or string
	// Accepts:
	// - refreshAuthorization: Authorization - Authorization for acquiring the refresh token
	// - url: String - Whole url of the authentication end point
	// - tokenDuration: Option[Duration] - How long the session token lasts. None if infinitely (default)
	// - style: String - model style to request (default = 'simple')
	static refresh(refreshAuthorization, url, tokenDuration = None, style = 'simple') {
		return Authorization.requestTokenString(() => refreshAuthorization.token.then(token => fetch(url, {
			headers: { 
				Authorization: 'Bearer ' + token, 
				'X-Style': style
			}
		})), tokenDuration)
	}


	// COMPUTER	----------------------------

	// Whether there is currently a valid token available
	get isAuthorized() { return this._tokenCache.current.exists(promise => promise.success.exists(token => token.isValid)) }

	// Available authorization token as a stateful promise
	get token() {
		// Checks whether currently cached token is still valid
		// Generates a new token if necessary
		if (this._tokenCache.current.exists(p => p.isFailure || p.success.exists(token => token.isExpired)))
			this._tokenCache.reset()
		// Won't yield expired tokens even with the new acquisition
		return this._tokenCache.value.mapSuccess(token => {
			if (token.isExpired)
				return Failure(new Error('Expired session'))
			else
				return Success(token)
		})
	}


	// OTHER--------------------------------

	// Creates a copy of this authorization that relies on a backup authorization
	// Accepts an authorization instance (or a function that returns a token or a token promise)
	withBackup(backupAuthorization) {
		if (backupAuthorization instanceof Authorization)
			return Authorization.combo(this, backupAuthorization)
		else
			return Authorization.combo(this, new Authorization(backupAuthorization))
	}
}

// Api objects are used for making requests to remote servers
// Api's handle session management and request processing / json parsing
// TODO: Handle language selection
export class Api {

	// CONSTRUCTOR	------------------------

	// Accepts: 
	// - root path: String, which is applied to all requests - should end in /
	// - authorization: Authorization - For session management (default = automatic failure)
	// - authFailureHandler: Option[() => Any] - Callback function for cases when authorization fails
	constructor(baseUri, sessionAuthorization = Authorization.failure, languagePointer = new Pointer(None), authFailureHandler = None) {
		// Root path, including last / - String (immutable)
		this._base = baseUri
		// Session authorization logic (mutable)
		this._session = sessionAuthorization
		// Auth callback
		this._authFailureHandler = Option.flat(authFailureHandler)
		this.languagePointer = languagePointer
	}


	// COMPUTED	----------------------------

	// Common path to all requests made through this API
	get rootPath() { return this._base }

	// Whether there is currently a session open on this API
	get isSessionOpen() { return this._session.isAuthorized }
	// Authorization header to use. As a promise.
	get authorizationHeader() { return this._session.token.then(t => 'Bearer ' + t) }

	// Currently selected language: Option[Int|String]
	get language() { return this.languagePointer.value }
	set language(newLanguage) { this.languagePointer.value = Option.flat(newLanguage) }


	// OTHER	----------------------------

	// Updates the authorization logic used by this API
	setAuthorization(newAuthorization) {
		this._session = newAuthorization;
	}
	// Updates the authentication failure handler callback
	setAuthFailureHandler(failureHandler) {
		this._authFailureHandler = Some(failureHandler)
	}

	// Tests whether authorization is available
	// Returns Promise[Boolean]
	testAuthorization() { 
		return this._session.token.then(token => token.isValid, () => false)
	}

	// Performs a request to the specified uri
	// Doesn't specify, nor require, authorization
	// Accepts: 
	// - path: String - Path after the root path
	// - method: String - Method to use in this request (default = 'GET')
	// - body: Option[Object] - Body to pass along with this request, will be converted to json (default = None)
	// - headers: Object - Headers to apply (default = empty)
	// - style: String - Model style expected in the response, 'simple' (default) or 'full'
	// Returns an AsyncResponse
	requestWithoutAuthorization(path, method = 'GET', body = None, headers = {}, style = 'simple') {
		// console.log(`Sending: ${method} ${path}...`)

		const that = this;
		const wrappedBody = Option.flat(body)
		// Forms the full headers (custom + style + content type)
		const fullHeaders = {
			'X-Style': style, 
			...headers
		}
		if (wrappedBody.nonEmpty)
			fullHeaders['Content-Type'] = 'application/json; charset=UTF-8'
		// Sets the accepted language
		Option.flat(this.language).foreach(lang => {
			if (typeof lang === 'string')
				fullHeaders['Accept-Language'] = lang
			else
				fullHeaders['X-Accept-Language-Ids'] = lang
		})
		// console.log(`Body: ${wrappedBody.map(b => JSON.stringify(b)).value}`)
		// console.log(`Headers: ${JSON.stringify(fullHeaders)}`)
		// Performs the query using fetch
		const response = fetch(that._base + path, {
			method: method,  
			headers: fullHeaders, 
			body: wrappedBody.map(b => JSON.stringify(b)).value
		})
		return new AsyncResponse(response)
	}

	// Performs a request to the specified uri
	// Uses standard authorization
	// Accepts: 
	// - path: String - Path after the root path
	// - method: String - Method to use in this request (default = 'GET')
	// - body: Option[Object] - Body to pass along with this request, will be converted to json (default = None)
	// - headers: Object - Additional headers to apply (default = empty)
	// - style: String - Model style expected in the response, 'simple' (default) or 'full'
	// Returns an AsyncResponse
	request(path, method = 'GET', body = None, headers = {}, style = 'simple') {
		const that = this;
		const response = this.authorizationHeader
			.catch(error => {
				// Relays token handling failures to the authentication failure handler
				this._authFailureHandler.foreach(h => h(error))
				// console.log('Authorization failed at token acquisition')
				throw error;
			})
			.then(authHeader => {
				// console.log('Using auth: ' + authHeader)
				const fullHeaders = {
					Authorization: authHeader, 
					...headers
				}
				return that.requestWithoutAuthorization(path, method, body, fullHeaders, style)
					.then(response => {
						// console.log(`${method} ${path} => ${response.status}`)
						// console.log(`Request received response of type: ${typeof response}`)
						// Checks whether the response has unauthorized status and calls the failure handler if needed
						if (response.status === 401)
							this._authFailureHandler.foreach(h => h(response));
						return response;
					})
			})
		return AsyncResponse.resolve(response)
	}

	// Performs a GET request to the specified uri
	// Uses standard authorization
	// Accepts: 
	// - path: String - Path after the root path
	// - headers: Object - Additional headers to apply - Default = empty
	// - style: String - 'simple' (default) or 'full'
	// Returns an AsyncResponse
	get(path, headers = {}, style = 'simple') { return this.request(path, 'GET', None, headers, style) }

	// Performs a GET request to the specified path on the back end server and parses response to json
	// Expects an OK response (200-299)
	// Uses standard authorization
	// Parameters same as in get
	// Returns Promise[JSON]
	getJson(path, headers = {}, style = 'simple') {
		return this.get(path, headers, style).successJson
	}

	// Performs a GET request to a path on the back end server. Expects json result on success
	// Supports a 'since' payload parameter (optional)
	// Accepts:
	// - path: String (see get)
	// - since: Option[RichDate] - Time threshold for If-Modified-Since -header
	// - headers & style (see get)
	// Successful result is wrapped in an option, containing None if Not Modified was returned
	getJsonIfModified(path, since, headers = {}, style = 'simple') {
		const modifiedHeaders = new Option(since).flatten.match(t => {
			if (headers == null)
				return { 'If-Modified-Since': t.toHeaderValue };
			else
				return {
					'If-Modified-Since': t.toHeaderValue, 
					...headers
				}
		}, () => headers);

		// Performs the GET and handles status 304 (Not Modified)
		return this.get(path, modifiedHeaders, style).then(response => {
			if (response.status === 304)
				return None;
			else if (response.ok)
				return response.json().then(json => Some(json));
			else
				throw new Error(response.status.toString());
		});
	}

	// Performs a POST/PUT/PATCH request to a back end server path with a json body
	// Uses standard authorization
	// Accepts:
	// - path: String (see get)
	// - body: Object - Will be converted to json (default = empty)
	// - method: String - Method to use (default = 'POST')
	// - headers: Object - Additional headers to provide (default = empty)
	// - style: String (see get)
	// Returns an AsyncResponse
	push(path, body = {}, method = 'POST', headers = {}, style = 'simple') { return this.request(path, method, body, headers, style); }

	// Performs a DELETE request to a back end server path
	// Uses standard authorization
	// Accepts:
	// - path: String (see get)
	// - headers: Object - additional headers to provide (default = empty)
	// Returns an AsyncResponse
	delete(path, headers = {}) { return this.request(path, 'DELETE', {}, headers) }
}