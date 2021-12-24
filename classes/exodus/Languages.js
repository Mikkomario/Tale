import { Vector } from '../tale/struct/Vector'
import { Language } from './Language'
import { Resource } from '../tale/controller/Resource'

export class Languages {
	constructor(api) {
		this.resource = Resource.from(api, 'languages', json => new Vector(json).map(lang => Language.fromJson(lang)))
		const that = this
		api.languagePointer.onChange(() => that.resource.invalidate())
	}

	get value() { return this.resource.value }
}