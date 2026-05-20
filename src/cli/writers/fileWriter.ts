import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedFile } from '../../core/types.js';

/**
 * Loads the three EJS template files bundled with this package.
 *
 * After build the CLI entry point lives at `dist/cli/index.js`, so this
 * file is at `dist/cli/writers/fileWriter.js` and the templates are one
 * level up at `dist/templates/`.
 *
 * @returns An object containing the raw EJS template strings for the model,
 * controller and routes files.
 *
 * @example
 * const { model, controller, routes } = await loadTemplates();
 */
export async function loadTemplates(): Promise<{ model: string; controller: string; routes: string }> {
  const templatesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates');

  const [model, controller, routes] = await Promise.all([
    readFile(join(templatesDir, 'model.ejs'), 'utf-8'),
    readFile(join(templatesDir, 'controller.ejs'), 'utf-8'),
    readFile(join(templatesDir, 'routes.ejs'), 'utf-8'),
  ]);

  return { model, controller, routes };
}

/**
 * Writes an array of generated files to disk under a given output directory.
 *
 * Each file's parent directory is created recursively before the file is
 * written. Directories are created sequentially (to avoid race conditions
 * when sibling paths share a parent), then all writes are issued in parallel.
 *
 * @param files - Array of `GeneratedFile` objects each carrying a relative
 * `filePath` and the `content` string to write.
 * @param outputDir - Absolute (or CWD-relative) root directory under which
 * every `file.filePath` is resolved.
 * @returns An array of the absolute paths that were written, in the same
 * order as the input `files` array.
 *
 * @example
 * const written = await writeGeneratedFiles(generatedFiles, process.cwd());
 * console.log(written); // ['/.../src/models/User.ts', ...]
 */
export async function writeGeneratedFiles(files: GeneratedFile[], outputDir: string): Promise<string[]> {
  const writtenPaths: string[] = [];

  for (const file of files) {
    const fullPath = join(outputDir, file.filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    if (existsSync(fullPath)) {
      console.warn(`Warning: Overwriting existing file ${fullPath}`);
    }
    await writeFile(fullPath, file.content, 'utf-8');
    writtenPaths.push(fullPath);
  }

  return writtenPaths;
}
