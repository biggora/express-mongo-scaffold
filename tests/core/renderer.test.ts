import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTemplate, renderAll } from '../../src/core/renderer/templateRenderer.js';
import type { ModelConfig } from '../../src/core/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, '..', '..', 'src', 'templates');

const testConfig: ModelConfig = {
  modelName: 'Product',
  varName: 'product',
  routePath: 'products',
  fields: [
    { name: 'name', type: 'String', required: true, indexed: false },
    { name: 'price', type: 'Number', required: true, indexed: false },
    { name: 'inStock', type: 'Boolean', required: false, indexed: false },
  ],
  timestamps: true,
};

const configWithRef: ModelConfig = {
  modelName: 'Order',
  varName: 'order',
  routePath: 'orders',
  fields: [
    { name: 'customer', type: 'ObjectId', required: true, indexed: false, ref: 'User' },
  ],
  timestamps: true,
};

const emptyConfig: ModelConfig = {
  modelName: 'Empty',
  varName: 'empty',
  routePath: 'empties',
  fields: [],
  timestamps: false,
};

function loadTemplates() {
  return {
    model: readFileSync(join(templatesDir, 'model.ejs'), 'utf-8'),
    controller: readFileSync(join(templatesDir, 'controller.ejs'), 'utf-8'),
    routes: readFileSync(join(templatesDir, 'routes.ejs'), 'utf-8'),
  };
}

describe('renderTemplate', () => {
  it('interpolates modelName into a simple expression template', () => {
    const result = renderTemplate('<%= config.modelName %>', testConfig);
    expect(result).toBe('Product');
  });

  it('iterates over fields and renders each field name', () => {
    const template = '<% for (const field of config.fields) { %><%= field.name %> <% } %>';
    const result = renderTemplate(template, testConfig);
    expect(result).toContain('name');
    expect(result).toContain('price');
    expect(result).toContain('inStock');
  });
});

describe('renderAll', () => {
  it('returns an array of exactly 3 files', () => {
    const templates = loadTemplates();
    const files = renderAll(templates, testConfig);
    expect(files).toHaveLength(3);
  });

  it('produces the correct file paths', () => {
    const templates = loadTemplates();
    const files = renderAll(templates, testConfig);
    const paths = files.map((f) => f.filePath);
    expect(paths).toContain('models/Product.js');
    expect(paths).toContain('controllers/productController.js');
    expect(paths).toContain('routes/productRoutes.js');
  });

  it('each file has non-empty string content', () => {
    const templates = loadTemplates();
    const files = renderAll(templates, testConfig);
    for (const file of files) {
      expect(typeof file.content).toBe('string');
      expect(file.content.length).toBeGreaterThan(0);
    }
  });

  describe('model file content', () => {
    it('contains mongoose.Schema', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, testConfig);
      expect(model.content).toContain('mongoose.Schema');
    });

    it('contains mongoose.model with the model name', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, testConfig);
      expect(model.content).toContain("mongoose.model('Product'");
    });

    it('contains the schema variable name', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, testConfig);
      expect(model.content).toContain('productSchema');
    });

    it('marks required fields with required: true', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, testConfig);
      expect(model.content).toContain('required: true');
    });
  });

  describe('controller file content', () => {
    it('contains all 5 CRUD function names', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const controller = files.find((f) => f.filePath.includes('Controller'))!;
      expect(controller.content).toContain('getAll');
      expect(controller.content).toContain('getById');
      expect(controller.content).toContain('create');
      expect(controller.content).toContain('update');
      expect(controller.content).toContain('remove');
    });

    it('uses Promise.all for parallel queries', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const controller = files.find((f) => f.filePath.includes('Controller'))!;
      expect(controller.content).toContain('Promise.all');
    });

    it('uses .lean() for performance', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const controller = files.find((f) => f.filePath.includes('Controller'))!;
      expect(controller.content).toContain('.lean()');
    });

    it('uses Math.max and Math.min for pagination bounds', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const controller = files.find((f) => f.filePath.includes('Controller'))!;
      expect(controller.content).toContain('Math.max');
      expect(controller.content).toContain('Math.min');
    });
  });

  describe('routes file content', () => {
    it('creates an express Router', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const routes = files.find((f) => f.filePath.includes('Routes'))!;
      expect(routes.content).toContain('express.Router()');
    });

    it('registers all 5 HTTP method handlers', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const routes = files.find((f) => f.filePath.includes('Routes'))!;
      expect(routes.content).toContain('router.get');
      expect(routes.content).toContain('router.post');
      expect(routes.content).toContain('router.put');
      expect(routes.content).toContain('router.delete');
    });

    it('exports the router via module.exports', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, testConfig);
      const routes = files.find((f) => f.filePath.includes('Routes'))!;
      expect(routes.content).toContain('module.exports');
    });
  });

  describe('ObjectId field rendering', () => {
    it('uses mongoose.Schema.Types.ObjectId for ObjectId fields', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, configWithRef);
      expect(model.content).toContain('mongoose.Schema.Types.ObjectId');
    });

    it('includes the ref value for ObjectId fields', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, configWithRef);
      expect(model.content).toContain("ref: 'User'");
    });
  });

  describe('empty fields config', () => {
    it('still returns 3 files', () => {
      const templates = loadTemplates();
      const files = renderAll(templates, emptyConfig);
      expect(files).toHaveLength(3);
    });

    it('sets timestamps: false in the model output', () => {
      const templates = loadTemplates();
      const [model] = renderAll(templates, emptyConfig);
      expect(model.content).toContain('timestamps: false');
    });
  });
});
