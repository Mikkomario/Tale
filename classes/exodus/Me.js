import { Option, None } from '../tale/struct/Option'
import { Vector } from '../tale/struct/Vector'
import { minutes } from '../tale/time/Duration'
import { Resource } from '../tale/controller/Resource'
import { Language } from './Language'

export class MyOrganization {
	constructor(id, name, myRoleIds = Vector.empty, myTaskIds = Vector.empty) {
		this.id = id
		this.name = name
		this.roleIds = myRoleIds
		this.taskIds = myTaskIds
	}

	static fromJson(json) {
		return new MyOrganization(json.id, json.name, Vector.flat(json.my_role_ids), Vector.flat(json.my_task_ids))
	}
}

export class MyLanguage {
	constructor(language, familiarity) {
		this.language = language
		this.familiarity = familiarity
	}

	static fromJson(json) {
		return new MyLanguage(Language.fromJson(json), json.familiarity)
	}

	get id() { return this.language.id }
	get name() { return this.language.name }

	toString() { return `${this.language.name} (${this.familiarity.name})` }
}

export class MySettings {
	constructor(userId, name, email = None) {
		this.userId = userId
		this.name = name
		this.email = Option.flat(email)
	}

	static fromJson(json) {
		return new MySettings(json.user_id, json.name, new Option(json.email))
	}
}

// Used for interacting with authorized user's data
export class Me {
	constructor(api) {
		this.api = api
		this.organizationsResource = Resource.from(api, 'users/me/organizations', 
			json => Vector.flat(json).map(json => MyOrganization.fromJson(json)), 
			minutes(5), true)
		this.languagesResource = Resource.from(api, 'users/me/languages', 
			json => Vector.flat(json).map(json => MyLanguage.fromJson(json)), minutes(30))
		this.settingsResource = Resource.from(api, 'users/me/settings', json => MySettings.fromJson(json), minutes(30))
	}

	get settings() { return this.settingsResource.value }
	set settings(newSettings) { this.settingsResource.value = newSettings }

	get organizations() { return this.organizationsResource.value }
	get languages() { return this.languagesResource.value }
	set languages(newLanguages) { this.languagesResource.value = newLanguages }

	get id() { return this.settings.then(s => s.id) }
	get name() { return this.settings.then(s => s.name) }
	get email() { return this.settings.then(s => s.email) }

	roleIdsIn(organizationId) { 
		return this.organizations
			.then(organizations => organizations.find(o => o.id == organizationId).match(o => o.roleIds, Vector.empty)) 
	}

	hasRole(roleId, organizationId = None) {
		return this.organizations
			.then(organizations => Option.flat(organizationId).match(
				oId => organizations.exists(o => o.id == organizationId && o.roleIds.contains(roleId)), 
				() => organizations.exists(o => o.roleIds.contains(roleId))))
	}
	isTaskEnabled(taskId, organizationId = None) {
		return this.organizations
			.then(organizations => Option.flat(organizationId).match(
				oId => organizations.exists(o => o.id == oId && o.taskIds.contains(taskId)), 
				() => organizations.exists(o => o.taskIds.contains(taskId))))
	}
}