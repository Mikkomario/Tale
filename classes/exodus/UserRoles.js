import { Vector } from '../tale/struct/Vector'
import { Resource } from '../tale/controller/Resource'
import { UserRole } from './UserRole'

export class UserRoles {
	constructor(api) {
		this.resource = Resource.from(api, 'user-roles', json => Vector.flat(json).map(json => UserRole.fromJson(json)))
		const that = this
		api.languagePointer.onChange(() => that.resource.invalidate())
	}

	get value() { return this.resource.value }
}