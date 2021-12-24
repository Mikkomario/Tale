import { Option, Some, None } from '../struct/Option'
import { RichDate, Now } from './RichDate'
import { Duration } from './Duration'

// Used for repeating actions for an extended period of time
export class Loop {
	// CONSTRUCTOR	------------------------------

	// Accepts:
	// interval: Duration - How often this loop is repeated (may also be of type int (millis))
	// action: () => Boolean - Action performed upon the specified intervals (may return true/false or Promise[Boolean], whether to continue (optional))
	// 		- Other supported return values are:
	//			- Duration | RichDate | Promise[Duration] | Promise[RichDate] - For specifying a new custom interval to apply from now on 
	// 			(treated as an indication to continue)
	//			- None, which is treated as false, terminating this loop
	//			- Some(X) is treated as X
	constructor(interval, action) {
		this.interval = Duration.flat(interval)
		this.action = action
		this.waitId = None
	}


	// STATIC	---------------------------------

	// Creates a new loop and starts it immediately
	// Accepts: 
	// interval: Duration - time interval between function calls
	// action: () => Boolean - Action to perform (see constructor)
	// immediately: Boolean - Whether the action should be run immediately (true) or after first wait (false, default)
	// Returns: Newly created (and started) loop instance
	static start(interval, action, immediately = false) {
		const instance = new Loop(interval, action)
		instance.start(immediately)
		return instance
	}

	// Creates a new loop that continues as long as the specified condition returns true
	// Accepts:
	// interval: Duration - See constructor
	// action: () => () - A function to run regularly
	// continueCheck: () => Boolean - A function that returns true as long as the action should be repeated
	// immediately: Boolean = see start
	// Returns: Newly created (and started) loop instance 
	static while(interval, action, continueCheck = () => true, immediately = false) {
		return Loop.start(interval, () => {
			action()
			return continueCheck()
		}, immediately)
	}


	// COMPUTED	---------------------------------

	// Whether this loop is currently running
	get isRunning() { return this.waitId.isDefined }
	// Whether this loop has been stopped or hasn't been started
	get isStopped() { return !this.isRunning }


	// OTHER	---------------------------------

	// Starts this loop, if it isn't started already
	// Accepts: 
	// immediately: Boolean - Whether the action should be triggered before the first wait (default = false)
	start(immediately = false) {
		// Checks whether this loop is running already
		if (this.isStopped) {
			// Case: Should trigger the action at once => does so
			if (immediately) {
				const result = this.action()
				// Evaluates whether loop should start based on the action results
				this._checkResult(result)
			}
			// Case: Should wait before triggering => continues into first wait
			else
				this._continue(this)
		}
	}

	// Stops this loop, if running
	stop() {
		this.waitId.foreach(id => clearTimeout(id))
		this.waitId = None
	}

	// Private
	// Continues loop. Recursive.
	_continue(thisRef) { 
		// Always remembers the latest wait id so that the loop may be cancelled / stopped
		thisRef.waitId = Some(setTimeout(() => {
			// Runs the action function and evaluates the result
			const result = thisRef.action()
			thisRef._checkResult(result, thisRef)
		}, thisRef.interval.toMillis))
	}

	_checkResult(result, that = this) {
		// Case: Result is not defined or indicates that this loop should be continued => continues
		if (result === undefined || result === null || result === true)
			that._continue(that)
		// Case: Result specifies a new wait duration => applies it and continues
		else if (result instanceof Duration) {
			that.interval = result
			that._continue(that)
		}
		// Case: Result specifies a new wait target time => waits until it and then continues
		else if (result instanceof RichDate) {
			if (result.isInFuture)
				that.interval = result.minus(Now)
			else
				that.interval = Duration.zero
			that._continue(that)
		}
		// Case: Result is wrapped in an option => unwraps it and treats None as false / terminate
		else if (result instanceof Option)
			result.match(
				wrapped => that._checkResult(wrapped), 
				() => that.waitId = None)
		// Case: Result is a promise => waits until it is resolved and acts according to its contents
		else if (result.then !== undefined)
			result.then(asyncResult => that._checkResult(asyncResult, that))
		// Case: Result indicates that this loop shouldn't continue => clears wait
		else
			that.waitId = None
	}
}