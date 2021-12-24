// Tests the Field class

import { Option } from '@/classes/tale/struct/Option'
import { Field } from '@/classes/tale/component/Field'

describe('Field', () => {
	test('value set and acquisition', () => {
		const field = Field.empty(false);

		expect(field.value.isEmpty).toBe(true);

		field.value = Option.some('TEST');

		expect(field.value.value).toBe('TEST');
	})
	test('isEmpty and nonEmpty change on fill', () => {
		const field = Field.empty(false);

		expect(field.isEmpty).toBe(true);
		expect(field.nonEmpty).toBe(false);

		field.value = Option.some('TEST');

		expect(field.isEmpty).toBe(false);
		expect(field.nonEmpty).toBe(true);
	})
	test('text get and set', () => {
		const field = Field.filled('TEST');

		expect(field.nonEmpty).toBe(true);
		expect(field.text).toBe('TEST');

		field.text = '';

		expect(field.isEmpty).toBe(true);

		field.text = 'TEST2';

		expect(field.nonEmpty).toBe(true);
		expect(field.text).toBe('TEST2');
	})
	test('flag activation on test', () => {
		const required = Field.empty(true);
		const optional = Field.empty(false);
		const filled = Field.filled('A');

		expect(required.flag).toBe(false);
		expect(optional.flag).toBe(false);
		expect(filled.flag).toBe(false);

		expect(required.test()).toBe(false);
		expect(optional.test()).toBe(true);
		expect(filled.test()).toBe(true);

		expect(required.flag).toBe(true);
		expect(optional.flag).toBe(false);
		expect(filled.flag).toBe(false);
	})
	test('flag reset on input', () => {
		const field = Field.empty(true);

		field.test();

		expect(field.flag).toBe(true);

		field.text = '';

		expect(field.flag).toBe(true);

		field.text = 'A';

		expect(field.flag).toBe(false);
	})
})