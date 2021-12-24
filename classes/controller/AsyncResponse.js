import { Option, None } from '../struct/Option'

function statusMessage(status) {
	if (status === 503)
		return 'The server is temporarily unavailable. Please wait a while and try again.'
	else if (status === 501)
		return "This feature  hasn't been implemented yet"
	else if (status === 405)
		return 'This feature is not available'
	else if (status === 404)
		return 'Attempted to target a non-existing resource'
	else if (status === 403)
		return 'Attempt rejected'
	else if (status === 401)
		return 'Not authorized'
	else if (status === 400)
		return 'Invalid request'
	else if (status >= 500)
		return 'Attempt failed due to a server-side problem'
	else
		return 'Attempt failed'
}

// A utility class for handling response promises
// Wraps a Promise[Response]
export class AsyncResponse {
	// CONSTRUCTOR	--------------------------------

	// Wraps a Promise[Response]
	constructor(wrapped) {
		this.wrapped = wrapped
	}

	// Wrappers for Promise.resolve & .reject
	static resolve(response) {
		return new AsyncResponse(Promise.resolve(response))
	}
	static reject(error) {
		return new AsyncResponse(Promise.reject(error))
	}


	// COMPUTED	------------------------------------

	// Returns Promise[Response] where the response is always successful (status 200-299)
	// Failure state message is read from response body or response status, if possible
	get success() {
		const that = this
		return this.wrapped.then(response => that._handleResponse(response))
	}
	// Returns Promise[JSON], read from a successful response
	// Failure state message is read from response body or response status, if possible
	get successJson() { return this.success.then(response => response.json()) }

	// Access to wrapped properties
	get ok() { return this.wrapped.ok }


	// OTHER	------------------------------------

	// Access to wrapped promise functions
	then(onResolve = a => a, onReject = function(e) { throw e }) { return this.wrapped.then(onResolve, onReject) }
	catch(onReject) { return this.wrapped.catch(onReject) }
	text() { return this.wrapped.text() }

	// Accepts:
	// handlers: Dict[Int, Response => Any] - Keys are response status codes and values are functions to handle those responses
	// successHandler: Response => Any - A function that accepts a successful (200-299) response (not covered by specified handlers)
	// Returns: Promise of one of those function values, or a failed promise if response was failure not covered by specified handlers
	handleStatuses(handlers, successHandler) {
		const that = this
		return this.wrapped.then(response => handlers.get(response.status).match(
			handler => handler(response), 
			() => that._handleResponse(response).then(success => successHandler(success)))
		)
	}
	// Accepts:
	// - status: Int - Status that receives special handling
	// - statusHandler: Response => Any - Function called if the response status matches the specified status
	// - successHandler: Response => Any - Function called if the response is a success (and outside specified status)
	// Returns: Promise of either function result, or a failed promise if response was failure outside of the specified status
	handleStatus(status, statusHandler, successHandler) {
		const that = this
		return this.wrapped.then(response => {
			if (response.status === status)
				return statusHandler(response)
			else
				return that._handleResponse(response).then(success => successHandler(success))
		})
	}

	_handleResponse(response) {
		if (response instanceof Response) {
			if (response.ok)
				return Promise.resolve(response)
			else
				return response.text().then(t => new Option(t)).catch(() => None)
					.then(t => t.match(
						text => throw new Error(text), 
						() => throw new Error(statusMessage(response.status))))
		}
		else {
			console.log(`Asyncresponse wrapping type: ${typeof response}`)
			console.log(response)
			throw new Error('AsyncResponse wrapping a non-response promise')
		}
	}
}