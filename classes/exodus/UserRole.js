import { Option, None } from '../tale/struct/Option'
import { Vector } from '../tale/struct/Vector'

export class UserRole {
	constructor(id, name = None, taskIds = Vector.empty) {
		this.id = id
		this._name = Option.flat(name)
		this.taskIds = Vector.flat(taskIds)
	}

	static fromJson(json) {
		return new UserRole(json.id, json.name, json.task_ids)
	}

	get name() { return this._name.getOrElse(this.id) }

	toString() { return this.name }
	equals(other) {
		return this.id == other.id
	}

	allowsTask(taskId) {
		return this.taskIds.contains(taskId)
	}

	isAbove(other) {
		return this.taskIds.exists(taskId => !other.allowsTask(taskId))
	}
}