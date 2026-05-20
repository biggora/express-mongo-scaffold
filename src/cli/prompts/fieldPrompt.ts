import { input, select, confirm } from '@inquirer/prompts';
import type { FieldDefinition, FieldType } from '../../core/types.js';
import { validateFieldName, validateRefName } from '../../core/validator.js';

/**
 * Interactively prompts the user to define one or more Mongoose document fields.
 *
 * For each field the user is asked:
 * 1. Field name (validated via {@link validateFieldName})
 * 2. Field type (one of `String | Number | Boolean | Date | ObjectId`)
 * 3. Reference model name — only when type is `ObjectId` (validated via
 *    {@link validateRefName})
 * 4. Whether the field is required
 * 5. Whether the field should be indexed
 * 6. Whether to add another field
 *
 * The loop continues until the user declines to add another field.
 *
 * @returns A promise that resolves to an array of {@link FieldDefinition}
 * objects built from the user's answers.
 *
 * @example
 * const fields = await promptForFields();
 * // fields[0] === { name: 'email', type: 'String', required: true, indexed: true }
 */
export async function promptForFields(): Promise<FieldDefinition[]> {
  const fields: FieldDefinition[] = [];
  let addMore = true;

  while (addMore) {
    const name = await input({
      message: 'Field name:',
      validate: (value) => {
        const result = validateFieldName(value);
        return result === true ? true : result;
      },
    });

    const type = await select<FieldType>({
      message: 'Field type:',
      choices: [
        { value: 'String', name: 'String' },
        { value: 'Number', name: 'Number' },
        { value: 'Boolean', name: 'Boolean' },
        { value: 'Date', name: 'Date' },
        { value: 'ObjectId', name: 'ObjectId' },
      ],
    });

    let ref: string | undefined;
    if (type === 'ObjectId') {
      ref = await input({
        message: 'Reference model:',
        validate: (value) => {
          const result = validateRefName(value);
          return result === true ? true : result;
        },
      });
    }

    const required = await confirm({
      message: 'Required?',
      default: false,
    });

    const indexed = await confirm({
      message: 'Indexed?',
      default: false,
    });

    const field: FieldDefinition = {
      name,
      type,
      required,
      indexed,
      ...(ref !== undefined ? { ref } : {}),
    };

    fields.push(field);

    addMore = await confirm({
      message: 'Add another field?',
      default: true,
    });
  }

  return fields;
}
