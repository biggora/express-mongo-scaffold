import type { FieldDefinition, FieldType } from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_FIELD_TYPES: ReadonlySet<string> = new Set([
  'String', 'Number', 'Boolean', 'Date', 'ObjectId',
]);

const RESERVED_MODEL_NAMES: ReadonlySet<string> = new Set([
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Date',
  'Function', 'Symbol', 'Error', 'RegExp', 'Promise', 'Map', 'Set',
  'Schema', 'Model', 'Document', 'Query', 'Connection',
]);

const RESERVED_FIELD_NAMES: ReadonlySet<string> = new Set([
  '_id', '__v', 'id', 'schema', 'collection', 'modelName',
  'db', 'discriminatorMapping', 'prototype', 'constructor',
]);

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Validates a Mongoose model name.
 *
 * @param name - The candidate model name to validate.
 * @returns `true` when valid, or an error message string when invalid.
 *
 * @example
 * validateModelName('User');       // true
 * validateModelName('');           // 'Model name is required'
 * validateModelName('user');       // 'Model name must start with an uppercase letter'
 * validateModelName('String');     // 'Model name "String" is reserved'
 */
export function validateModelName(name: string): true | string {
  if (name.trim().length === 0) {
    return 'Model name is required';
  }

  if (!/^[A-Z]/.test(name)) {
    return 'Model name must start with an uppercase letter';
  }

  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return 'Model name must contain only alphanumeric characters';
  }

  if (name.length < 2 || name.length > 50) {
    return 'Model name must be between 2 and 50 characters';
  }

  if (RESERVED_MODEL_NAMES.has(name)) {
    return `Model name "${name}" is reserved`;
  }

  return true;
}

/**
 * Validates a Mongoose document field name.
 *
 * @param name - The candidate field name to validate.
 * @returns `true` when valid, or an error message string when invalid.
 *
 * @example
 * validateFieldName('email');      // true
 * validateFieldName('');           // 'Field name is required'
 * validateFieldName('Email');      // 'Field name must start with a lowercase letter'
 * validateFieldName('_id');        // 'Field name "_id" is reserved'
 */
export function validateFieldName(name: string): true | string {
  if (name.trim().length === 0) {
    return 'Field name is required';
  }

  if (!/^[a-z]/.test(name)) {
    return 'Field name must start with a lowercase letter';
  }

  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    return 'Field name must contain only alphanumeric characters';
  }

  if (name.length < 1 || name.length > 50) {
    return 'Field name must be between 1 and 50 characters';
  }

  if (RESERVED_FIELD_NAMES.has(name)) {
    return `Field name "${name}" is reserved`;
  }

  return true;
}

/**
 * Validates the name of a referenced model (used in ObjectId `ref` fields).
 * Delegates to {@link validateModelName} since reference targets must be valid
 * model names.
 *
 * @param name - The candidate reference model name to validate.
 * @returns `true` when valid, or an error message string when invalid.
 *
 * @example
 * validateRefName('User');     // true
 * validateRefName('user');     // 'Model name must start with an uppercase letter'
 */
export function validateRefName(name: string): true | string {
  return validateModelName(name);
}

/**
 * Parses the `--fields` CLI flag string into an array of {@link FieldDefinition} objects.
 *
 * Format: `"fieldName:Type[:modifier[:modifier...]][,...]"`
 *
 * Supported modifiers:
 * - `required` — marks the field as required
 * - `indexed`  — adds a MongoDB index on the field
 * - `ref=ModelName` — sets the reference model (only meaningful for `ObjectId` fields)
 *
 * @param flagValue - The raw comma-separated fields string from the CLI flag.
 * @returns An array of parsed {@link FieldDefinition} objects.
 *
 * @throws {Error} When `flagValue` is empty or contains no valid field entries.
 * @throws {Error} When a field name fails validation.
 * @throws {Error} When a field type is not one of the supported types.
 * @throws {Error} When a `ref=` value fails model-name validation.
 *
 * @example
 * parseFieldsFlag('name:String:required,email:String:required:indexed,author:ObjectId:ref=User:required');
 * // [
 * //   { name: 'name',   type: 'String',   required: true,  indexed: false },
 * //   { name: 'email',  type: 'String',   required: true,  indexed: true  },
 * //   { name: 'author', type: 'ObjectId', required: true,  indexed: false, ref: 'User' },
 * // ]
 */
export function parseFieldsFlag(flagValue: string): FieldDefinition[] {
  if (flagValue.trim().length === 0) {
    throw new Error('Fields flag value is required and cannot be empty');
  }

  const entries = flagValue.split(',').map((e) => e.trim()).filter((e) => e.length > 0);

  if (entries.length === 0) {
    throw new Error('Fields flag value is required and cannot be empty');
  }

  const fields: FieldDefinition[] = [];

  for (const entry of entries) {
    const parts = entry.split(':');
    const name = parts[0] ?? '';
    const typeStr = parts[1] ?? '';
    const modifiers = parts.slice(2);

    // Validate field name
    const nameResult = validateFieldName(name);
    if (nameResult !== true) {
      throw new Error(nameResult);
    }

    // Validate field type
    if (!VALID_FIELD_TYPES.has(typeStr)) {
      throw new Error(`Invalid field type "${typeStr}" for field "${name}"`);
    }

    // Parse modifiers
    let required = false;
    let indexed = false;
    let ref: string | undefined;

    for (const modifier of modifiers) {
      if (modifier === 'required') {
        required = true;
      } else if (modifier === 'indexed') {
        indexed = true;
      } else if (modifier.startsWith('ref=')) {
        const refName = modifier.slice(4);
        const refResult = validateRefName(refName);
        if (refResult !== true) {
          throw new Error(refResult);
        }
        ref = refName;
      }
      // Unknown modifiers are silently ignored — future-proofing without speculation
    }

    const field: FieldDefinition = {
      name,
      type: typeStr as FieldType,
      required,
      indexed,
      ...(ref !== undefined ? { ref } : {}),
    };

    fields.push(field);
  }

  return fields;
}
