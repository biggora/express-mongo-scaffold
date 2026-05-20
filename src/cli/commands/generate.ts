import { Command } from 'commander';
import { toPascalCase, toCamelCase, toRoutePath } from '../../core/naming.js';
import { validateModelName, parseFieldsFlag } from '../../core/validator.js';
import { renderAll } from '../../core/renderer/templateRenderer.js';
import type { ModelConfig } from '../../core/types.js';
import { loadTemplates, writeGeneratedFiles } from '../writers/fileWriter.js';
import { promptForFields } from '../prompts/fieldPrompt.js';

export function registerGenerateCommand(program: Command): void {
  const generate = program
    .command('generate')
    .description('Generate scaffolding files');

  generate
    .command('model <name>')
    .description('Generate a Mongoose model, CRUD controller, and Express router')
    .option('--fields <fields>', 'Comma-separated field definitions (e.g. "name:String:required,age:Number")')
    .option('--output-dir <path>', 'Output directory', '.')
    .option('--no-timestamps', 'Disable timestamps (createdAt/updatedAt)')
    .action(async (name: string, options: { fields?: string; outputDir: string; timestamps: boolean }) => {
      try {
        // 1. Transform and validate model name
        const modelName = toPascalCase(name);
        const nameResult = validateModelName(modelName);
        if (nameResult !== true) {
          console.error(`Error: ${nameResult}`);
          process.exit(1);
        }

        // 2. Get fields: from --fields flag or interactive prompts
        const fields = options.fields
          ? parseFieldsFlag(options.fields)
          : await promptForFields();

        // Check for duplicate field names
        const seen = new Set<string>();
        const uniqueFields = fields.filter((field) => {
          if (seen.has(field.name)) {
            console.warn(`Warning: Duplicate field "${field.name}" — keeping first occurrence.`);
            return false;
          }
          seen.add(field.name);
          return true;
        });

        if (uniqueFields.length === 0) {
          console.warn('Warning: No fields defined. Generating model with empty schema.');
        }

        // 3. Build ModelConfig
        const config: ModelConfig = {
          modelName,
          varName: toCamelCase(name),
          routePath: toRoutePath(modelName),
          fields: uniqueFields,
          timestamps: options.timestamps,
        };

        // 4. Load templates and render
        const templates = await loadTemplates();
        const generatedFiles = renderAll(templates, config);

        // 5. Write files
        const writtenPaths = await writeGeneratedFiles(generatedFiles, options.outputDir);

        // 6. Print summary
        console.log(`\nGenerated files for model "${modelName}":`);
        for (const filePath of writtenPaths) {
          console.log(`  ✓ ${filePath}`);
        }
        console.log('');
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error('An unexpected error occurred');
        }
        process.exit(1);
      }
    });
}
