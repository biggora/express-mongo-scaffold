import { describe, it, expect } from 'vitest';
import {
  validateModelName,
  validateFieldName,
  validateRefName,
  parseFieldsFlag,
} from '../../src/core/validator.js';

// ---------------------------------------------------------------------------
// validateModelName
// ---------------------------------------------------------------------------

describe('validateModelName', () => {
  describe('valid names', () => {
    it('accepts a simple PascalCase name', () => {
      expect(validateModelName('User')).toBe(true);
    });

    it('accepts a multi-word PascalCase name', () => {
      expect(validateModelName('BlogPost')).toBe(true);
    });

    it('accepts a name at minimum length (2 characters)', () => {
      expect(validateModelName('Ab')).toBe(true);
    });

    it('accepts a name with alphanumeric characters', () => {
      expect(validateModelName('MyModel123')).toBe(true);
    });
  });

  describe('empty / blank input', () => {
    it('rejects an empty string', () => {
      const result = validateModelName('');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('required');
    });

    it('rejects a whitespace-only string', () => {
      const result = validateModelName('   ');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('required');
    });
  });

  describe('uppercase / first-character checks', () => {
    it('rejects a name that starts with a lowercase letter', () => {
      const result = validateModelName('user');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('uppercase');
    });

    it('rejects a name that starts with a digit', () => {
      const result = validateModelName('123Model');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('uppercase');
    });
  });

  describe('alphanumeric-only checks', () => {
    it('rejects a name containing a hyphen', () => {
      const result = validateModelName('My-Model');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('alphanumeric');
    });

    it('rejects a name containing an underscore', () => {
      const result = validateModelName('My_Model');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('alphanumeric');
    });
  });

  describe('length checks', () => {
    it('rejects a name that is too short (1 character)', () => {
      const result = validateModelName('A');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('between 2 and 50');
    });

    it('rejects a name that is too long (51 characters)', () => {
      const result = validateModelName('A' + 'a'.repeat(50));
      expect(result).toBeTypeOf('string');
      expect(result).toContain('between 2 and 50');
    });
  });

  describe('reserved name checks', () => {
    it('rejects "String" as a reserved name', () => {
      const result = validateModelName('String');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });

    it('rejects "Date" as a reserved name', () => {
      const result = validateModelName('Date');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });

    it('rejects "Schema" as a reserved name', () => {
      const result = validateModelName('Schema');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });

    it('rejects "Model" as a reserved name', () => {
      const result = validateModelName('Model');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });
  });
});

// ---------------------------------------------------------------------------
// validateFieldName
// ---------------------------------------------------------------------------

describe('validateFieldName', () => {
  describe('valid names', () => {
    it('accepts a simple camelCase name', () => {
      expect(validateFieldName('name')).toBe(true);
    });

    it('accepts a multi-word camelCase name', () => {
      expect(validateFieldName('blogPost')).toBe(true);
    });

    it('accepts a single-character name (minimum length 1)', () => {
      expect(validateFieldName('x')).toBe(true);
    });

    it('accepts a name with alphanumeric characters', () => {
      expect(validateFieldName('field123')).toBe(true);
    });
  });

  describe('empty / blank input', () => {
    it('rejects an empty string', () => {
      const result = validateFieldName('');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('required');
    });
  });

  describe('lowercase / first-character checks', () => {
    it('rejects a name that starts with an uppercase letter', () => {
      const result = validateFieldName('Name');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('lowercase');
    });

    it('rejects a name that starts with a digit', () => {
      const result = validateFieldName('123field');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('lowercase');
    });
  });

  describe('alphanumeric-only checks', () => {
    it('rejects a name containing a hyphen', () => {
      const result = validateFieldName('my-field');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('alphanumeric');
    });

    it('rejects a name containing an underscore', () => {
      const result = validateFieldName('my_field');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('alphanumeric');
    });
  });

  describe('length checks', () => {
    it('rejects a name that is too long (51 characters)', () => {
      const result = validateFieldName('a'.repeat(51));
      expect(result).toBeTypeOf('string');
      expect(result).toContain('between 1 and 50');
    });
  });

  describe('reserved name checks', () => {
    // "_id" and "__v" start with "_" so they fail the lowercase check before
    // reaching the reserved-name check; we verify any error string is returned.
    it('rejects "_id" (fails lowercase check before reserved check)', () => {
      const result = validateFieldName('_id');
      expect(result).toBeTypeOf('string');
    });

    it('rejects "__v" (fails lowercase check before reserved check)', () => {
      const result = validateFieldName('__v');
      expect(result).toBeTypeOf('string');
    });

    it('rejects "id" as a reserved name', () => {
      const result = validateFieldName('id');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });

    it('rejects "schema" as a reserved name', () => {
      const result = validateFieldName('schema');
      expect(result).toBeTypeOf('string');
      expect(result).toContain('reserved');
    });
  });
});

// ---------------------------------------------------------------------------
// validateRefName
// ---------------------------------------------------------------------------

describe('validateRefName', () => {
  it('accepts a valid model name', () => {
    expect(validateRefName('User')).toBe(true);
  });

  it('rejects a name that starts with a lowercase letter', () => {
    const result = validateRefName('user');
    expect(result).toBeTypeOf('string');
    expect(result).toContain('uppercase');
  });

  it('rejects an empty string', () => {
    const result = validateRefName('');
    expect(result).toBeTypeOf('string');
    expect(result).toContain('required');
  });
});

// ---------------------------------------------------------------------------
// parseFieldsFlag
// ---------------------------------------------------------------------------

describe('parseFieldsFlag', () => {
  describe('valid parsing', () => {
    it('parses a single required String field', () => {
      const result = parseFieldsFlag('name:String:required');
      expect(result).toEqual([
        { name: 'name', type: 'String', required: true, indexed: false },
      ]);
    });

    it('parses multiple fields separated by commas', () => {
      const result = parseFieldsFlag('name:String:required,email:String:required:indexed');
      expect(result).toEqual([
        { name: 'name',  type: 'String', required: true,  indexed: false },
        { name: 'email', type: 'String', required: true,  indexed: true  },
      ]);
    });

    it('parses a Number field without any modifiers', () => {
      const result = parseFieldsFlag('age:Number');
      expect(result).toEqual([
        { name: 'age', type: 'Number', required: false, indexed: false },
      ]);
    });

    it('parses an ObjectId field with a ref modifier', () => {
      const result = parseFieldsFlag('author:ObjectId:ref=User:required');
      expect(result).toEqual([
        { name: 'author', type: 'ObjectId', required: true, indexed: false, ref: 'User' },
      ]);
    });

    it('parses a Boolean field', () => {
      const result = parseFieldsFlag('active:Boolean');
      expect(result).toEqual([
        { name: 'active', type: 'Boolean', required: false, indexed: false },
      ]);
    });

    it('parses a Date field with the indexed modifier', () => {
      const result = parseFieldsFlag('created:Date:indexed');
      expect(result).toEqual([
        { name: 'created', type: 'Date', required: false, indexed: true },
      ]);
    });
  });

  describe('error cases', () => {
    it('throws when the flag value is an empty string', () => {
      expect(() => parseFieldsFlag('')).toThrow();
    });

    it('throws when the field type is not a supported type', () => {
      expect(() => parseFieldsFlag('name:InvalidType')).toThrow();
    });

    it('throws when the field name starts with an uppercase letter', () => {
      expect(() => parseFieldsFlag('Name:String')).toThrow();
    });

    it('throws when the field name is a reserved name', () => {
      expect(() => parseFieldsFlag('_id:String')).toThrow();
    });
  });
});
