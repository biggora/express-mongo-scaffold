import ejs from 'ejs';
import type { ModelConfig, GeneratedFile } from '../types.js';

/**
 * Renders an EJS template string with model configuration.
 * @param templateString - EJS template content as a string
 * @param config - Model configuration data
 * @returns Rendered template output
 * @throws If EJS encounters a syntax error or undefined variable in the template
 * @example
 * const result = renderTemplate('<%= config.modelName %>', config);
 */
export function renderTemplate(templateString: string, config: ModelConfig): string {
  return ejs.render(templateString, { config });
}

/**
 * Renders all three templates (model, controller, routes) and returns generated files.
 * @param templates - Object containing EJS template strings for model, controller, and routes
 * @param config - Model configuration data
 * @returns Array of generated files with relative paths and content
 * @example
 * const files = renderAll({ model: '...', controller: '...', routes: '...' }, config);
 */
export function renderAll(
  templates: { model: string; controller: string; routes: string },
  config: ModelConfig,
): GeneratedFile[] {
  return [
    {
      filePath: `models/${config.modelName}.js`,
      content: renderTemplate(templates.model, config),
    },
    {
      filePath: `controllers/${config.varName}Controller.js`,
      content: renderTemplate(templates.controller, config),
    },
    {
      filePath: `routes/${config.varName}Routes.js`,
      content: renderTemplate(templates.routes, config),
    },
  ];
}
