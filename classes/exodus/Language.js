import { Option, None } from '../tale/struct/Option'

// Represents a language
export class Language {
	constructor(id, code, name = None) {
		this.id = id
		this.code = code
		this._name = Option.flat(name)
	}

	static fromJson(json) {
		return new Language(json.id, json.iso_code, new Option(json.name))
	}

	get name() { return this._name.getOrElse(this.code) }

	toString() { return this.name }
}