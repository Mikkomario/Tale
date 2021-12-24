import { Vector } from '../tale/struct/Vector'
import { Resource } from '../tale/controller/Resource'

// Used for managing language familiarities, which are read from the server
export class LanguageFamiliarities {
	// Wraps an API
	constructor(api) {
		this.resource = Resource.from(api, 'language-familiarities', json => new Vector(json))
		const that = this
		api.languagePointer.onChange(() => that.resource.invalidate())
	}

	get value() { return this.resource.value }
}