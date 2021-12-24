import { None, Some } from '../struct/Option'
import { Vector } from '../struct/Vector'
import { Pair } from '../struct/Pair'
import { Left, Right } from '../struct/Either'
import { RichDate, Now } from './RichDate'
import { Duration, millis } from './Duration'

// Returns Either[Duration, RichDate]
function parseTarget(target) {
	// RichDate => Right[RichDate]
	if (target instanceof RichDate)
		return Right(target)
	// Date => Right[RichDate]
	else if (target instanceof Date)
		return Right(new RichDate(target))
	// Duration => Left[Duration]
	else if (target instanceof Duration)
		return Left(target)
	// Int => Left[Duration] - interpreted as a milliseconds count
	else if (typeof target === 'number')
		return Left(millis(target))
	// String => Right[RichDate] - Expects a date string
	else if (typeof target === 'string')
		return Right(new RichDate(target))
	else
		throw new Error(`${target} is not a valid wait target`)
}

// Used for performing delayed actions after a wait period
export class Wait {
	// CONSTRUCTOR	---------------------------------

	// Accepts: 
	// Target: Any - Supported data types are: RichDate, Date, Duration, Int (milliseconds) and String (date)
	// startImmediately: Boolean - Whether this wait should immediately be marked as started (default = false)
	constructor(target, startImmediately = false) {
		this.target = parseTarget(target)
		this.started = startImmediately ? Some(RichDate.now()) : None
		this.activeWaits = Vector.empty // Vector[Pair[Int, rejectFunction]]
	}


	// STATIC	------------------------------------

	// Creates a new wait and starts it immediately
	static start(target) { return new Wait(target, true) }



	// COMPUTED	------------------------------------

	// Returns: Whether this wait is not completed yet
	get isActive() { 
		return this.target.match(
			duration => this.started.exists(start => start.plus(duration).isInFuture), 
			time => time.isInFuture) 
	}
	// Returns: Whether this wait has completed already
	get isCompleted() { return !this.isActive }
	// Returns: Time when this wait ends. May be in the past.
	get targetTime() {
		return this.target.match(
			duration => this.started.match(start => start.plus(duration), () => Now.plus(duration)), 
			time => time)
	}
	// Returns: Duration left in this wait. May be negative.
	get remaining() {
		return this.targetTime.durationInFuture
	}


	// OTHER	-----------------------------------

	// Performs the specified function after this wait ends (starts this wait if not started already)
	// Accepts: A function to perform - may return a Promise or an immediate value
	// Returns: A promise of that function's completion (Promise[Promise] is flattened) - promise will fail if this wait is cancelled
	then(f) {
		// Marks this wait as started if not already running
		if (this.started.isEmpty || this.isCompleted)
			this.started = Some(RichDate.now())
		// Calculates the (remaining) wait duration
		const duration = this.remaining
		// Case: Action needs to be delayed => uses setTimeout(...)
		if (duration.isPositive) {
			const that = this
			// Returns a new promise
			return new Promise((resolve, reject) => {
				const waitId = setTimeout(() => {
					const result = typeof f === 'function' ? f() : f
					// Wraps the function call in a promise
					Promise.resolve(result)
						// Completes the original promise when done
						.then(s => resolve(s), error => reject(error))
						// Removes this promise from active waits
						.finally(() => that.activeWaits = that.activeWaits.filterNot(w => w.first === waitId))
				}, duration.toMillis)
				// Remembers this wait instance (so that it may be cancelled)
				that.activeWaits = that.activeWaits.plusOne(new Pair(waitId, reject))
			})
		}
		// Case: Action may be performed immediately => wraps it in a promise
		else
			return Promise.resolve(typeof f === 'function' ? f() : f)
	}

	// Cancels all pending wait actions, causing them to be rejected
	// Returns: Whether at least one action was cancelled
	cancel() {
		// Clears awaiting actions
		const waits = this.activeWaits
		this.activeWaits = Vector.empty
		// Rejects all awaiting actions
		waits.foreach(w => {
			clearTimeout(w.first)
			w.second(new Error('Wait cancelled'))
		})
		return waits.nonEmpty
	}
}