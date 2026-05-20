import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');
const tmpDir = join(projectRoot, 'tests', 'cli', '.tmp-generate');

function cli(args: string[], outDir: string): string {
  return execFileSync(
    process.execPath,
    ['dist/cli/index.js', ...args, '--output-dir', outDir],
    { encoding: 'utf-8', cwd: projectRoot, stdio: 'pipe' },
  );
}

beforeAll(() => {
  execSync('npm run build', {
    encoding: 'utf-8',
    cwd: projectRoot,
    stdio: 'pipe',
  });
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('CLI: generate model', () => {
  describe('generates 3 files with --fields flag', () => {
    const outDir = join(tmpDir, 'user-basic');

    beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      cli(
        ['generate', 'model', 'User', '--fields', 'name:String:required,email:String:required:indexed'],
        outDir,
      );
    });

    it('creates models/User.js', () => {
      expect(existsSync(join(outDir, 'models', 'User.js'))).toBe(true);
    });

    it('creates controllers/userController.js', () => {
      expect(existsSync(join(outDir, 'controllers', 'userController.js'))).toBe(true);
    });

    it('creates routes/userRoutes.js', () => {
      expect(existsSync(join(outDir, 'routes', 'userRoutes.js'))).toBe(true);
    });

    it('all 3 generated files are non-empty', () => {
      const model = readFileSync(join(outDir, 'models', 'User.js'), 'utf-8');
      const controller = readFileSync(join(outDir, 'controllers', 'userController.js'), 'utf-8');
      const routes = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(model.length).toBeGreaterThan(0);
      expect(controller.length).toBeGreaterThan(0);
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('generated model file is valid', () => {
    const outDir = join(tmpDir, 'user-model');

    beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      cli(
        ['generate', 'model', 'User', '--fields', 'name:String:required,email:String:required:indexed'],
        outDir,
      );
    });

    it('contains mongoose.Schema', () => {
      const content = readFileSync(join(outDir, 'models', 'User.js'), 'utf-8');
      expect(content).toContain('mongoose.Schema');
    });

    it("contains mongoose.model('User'", () => {
      const content = readFileSync(join(outDir, 'models', 'User.js'), 'utf-8');
      expect(content).toContain("mongoose.model('User'");
    });

    it('marks required fields with required: true', () => {
      const content = readFileSync(join(outDir, 'models', 'User.js'), 'utf-8');
      expect(content).toContain('required: true');
    });

    it('marks indexed fields with index: true', () => {
      const content = readFileSync(join(outDir, 'models', 'User.js'), 'utf-8');
      expect(content).toContain('index: true');
    });
  });

  describe('generated controller file is valid', () => {
    const outDir = join(tmpDir, 'user-controller');

    beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      cli(['generate', 'model', 'User', '--fields', 'name:String:required'], outDir);
    });

    it('contains all 5 CRUD function names', () => {
      const content = readFileSync(join(outDir, 'controllers', 'userController.js'), 'utf-8');
      expect(content).toContain('getAll');
      expect(content).toContain('getById');
      expect(content).toContain('create');
      expect(content).toContain('update');
      expect(content).toContain('remove');
    });

    it('uses Promise.all', () => {
      const content = readFileSync(join(outDir, 'controllers', 'userController.js'), 'utf-8');
      expect(content).toContain('Promise.all');
    });

    it('uses .lean()', () => {
      const content = readFileSync(join(outDir, 'controllers', 'userController.js'), 'utf-8');
      expect(content).toContain('.lean()');
    });
  });

  describe('generated routes file is valid', () => {
    const outDir = join(tmpDir, 'user-routes');

    beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      cli(['generate', 'model', 'User', '--fields', 'name:String:required'], outDir);
    });

    it('creates an express.Router()', () => {
      const content = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(content).toContain('express.Router()');
    });

    it('registers a GET route', () => {
      const content = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(content).toContain('router.get');
    });

    it('registers a POST route', () => {
      const content = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(content).toContain('router.post');
    });

    it('registers a PUT route', () => {
      const content = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(content).toContain('router.put');
    });

    it('registers a DELETE route', () => {
      const content = readFileSync(join(outDir, 'routes', 'userRoutes.js'), 'utf-8');
      expect(content).toContain('router.delete');
    });
  });

  describe('--no-timestamps flag', () => {
    const outDir = join(tmpDir, 'no-timestamps');

    beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      cli(
        ['generate', 'model', 'Widget', '--fields', 'label:String:required', '--no-timestamps'],
        outDir,
      );
    });

    it('sets timestamps: false in the model', () => {
      const content = readFileSync(join(outDir, 'models', 'Widget.js'), 'utf-8');
      expect(content).toContain('timestamps: false');
    });
  });

  describe('--output-dir flag', () => {
    const customDir = join(tmpDir, 'custom-output');

    beforeAll(() => {
      mkdirSync(customDir, { recursive: true });
      cli(['generate', 'model', 'Tag', '--fields', 'label:String:required'], customDir);
    });

    it('writes model file to the specified output directory', () => {
      expect(existsSync(join(customDir, 'models', 'Tag.js'))).toBe(true);
    });

    it('writes controller file to the specified output directory', () => {
      expect(existsSync(join(customDir, 'controllers', 'tagController.js'))).toBe(true);
    });

    it('writes routes file to the specified output directory', () => {
      expect(existsSync(join(customDir, 'routes', 'tagRoutes.js'))).toBe(true);
    });
  });

  describe('error cases', () => {
    it('exits with non-zero code for an invalid model name', () => {
      let threw = false;
      try {
        execFileSync(
          process.execPath,
          ['dist/cli/index.js', 'generate', 'model', '123bad', '--fields', 'name:String'],
          { encoding: 'utf-8', cwd: projectRoot, stdio: 'pipe' },
        );
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    });

    it('exits with non-zero code for an invalid field type', () => {
      let threw = false;
      try {
        execFileSync(
          process.execPath,
          [
            'dist/cli/index.js',
            'generate',
            'model',
            'Valid',
            '--fields',
            'name:InvalidType',
            '--output-dir',
            join(tmpDir, 'invalid-type'),
          ],
          { encoding: 'utf-8', cwd: projectRoot, stdio: 'pipe' },
        );
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    });
  });
});
