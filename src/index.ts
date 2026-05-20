// Types (must use `export type` due to verbatimModuleSyntax)
export type { FieldType, FieldDefinition, ModelConfig, GeneratedFile } from './core/types.js';

// Naming utilities
export { toPascalCase, toCamelCase, pluralize, toRoutePath } from './core/naming.js';

// Validation
export { validateModelName, validateFieldName, validateRefName, parseFieldsFlag } from './core/validator.js';

// Template rendering
export { renderTemplate, renderAll } from './core/renderer/templateRenderer.js';
