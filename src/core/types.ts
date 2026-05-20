/**
 * Supported Mongoose field types.
 */
export type FieldType = 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId';

/**
 * Definition of a single model field.
 * @example
 * const field: FieldDefinition = {
 *   name: 'email',
 *   type: 'String',
 *   required: true,
 *   indexed: true,
 * };
 */
export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  indexed: boolean;
  /** Reference model name for ObjectId fields */
  ref?: string;
}

/**
 * Complete configuration for model code generation.
 * @example
 * const config: ModelConfig = {
 *   modelName: 'User',
 *   varName: 'user',
 *   routePath: 'users',
 *   fields: [],
 *   timestamps: true,
 * };
 */
export interface ModelConfig {
  modelName: string;
  varName: string;
  routePath: string;
  fields: FieldDefinition[];
  timestamps: boolean;
}

/**
 * Represents a generated file with its relative path and content.
 * @example
 * const file: GeneratedFile = {
 *   filePath: 'src/models/User.ts',
 *   content: '// generated content',
 * };
 */
export interface GeneratedFile {
  filePath: string;
  content: string;
}
