import { Option, None } from '../tale/struct/Option'
import { Vector } from '../tale/struct/Vector'

// A model representing DetailedInvitation in Citadel
export class Invitation {
	// CONSTRUCTOR	------------------------------------

	// Accepts:
	// - id: Int - Id of this invitation
	// - roleId: Int - Id of the role the recipient will have
	// - organizationName: Option[String] - Name of the organization the recipient would join, if available
	// - senderName: Option[String] - Name of the person who sent this invitation, if available
	constructor(id, roleId, organizationName = None, senderName = None) {
		this.id = id
		this.roleId = roleId
		this.organizationName = Option.flat(organizationName) 
		this.senderName = Option.flat(senderName)
	}


	// STATIC	----------------------------------

	// Parses an invitation from a response
	// Expects simple model styling
	static fromJson(json) {
		// Reads organization name from either 'name' or 'names' -property under 'organization'
		const organizationName = new Option(json.organization).flatMap(o => new Option(o.name).orElse(() => Vector.flat(o.names).headOption))
		// Reads sender name from 'sender'.'name'
		return new Invitation(json.id, json.role_id, organizationName, new Option(json.sender).flatMap(s => new Option(s.name)))
	}
}