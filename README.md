# express-mongo-scaffold

CLI generator for Express.js + MongoDB REST API boilerplate. Generate Mongoose schemas, CRUD controllers with pagination, and Express routers in seconds.

## Features

- Mongoose model with schema validation, timestamps, and toJSON transform
- CRUD controller with pagination, bounds clamping, and tiered error handling
- Express router with RESTful endpoints
- Interactive and non-interactive (CI-friendly) modes
- Programmatic API for custom tooling
- Zero-config — works out of the box

## Installation

```bash
npm install -g express-mongo-scaffold
```

Or use directly with npx:

```bash
npx express-mongo-scaffold generate model User
```

## Requirements

Node.js >= 18.0.0

## Usage

### Interactive Mode

```bash
npx express-mongo-scaffold generate model User
```

You will be prompted for each field's name, type, and options.

### Non-Interactive Mode

```bash
npx express-mongo-scaffold generate model User \
  --fields "name:String:required,email:String:required:indexed,age:Number"
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--fields <fields>` | Comma-separated field definitions | Interactive prompts |
| `--output-dir <path>` | Output directory | `.` (current directory) |
| `--no-timestamps` | Disable createdAt/updatedAt | Enabled |

### Field Definition Format

```
fieldName:Type[:modifier[:modifier...]]
```

**Types:** `String`, `Number`, `Boolean`, `Date`, `ObjectId`

**Modifiers:**
- `required` — marks the field as required
- `indexed` — adds a MongoDB index
- `ref=ModelName` — sets a reference (ObjectId fields only)

**Examples:**
```
name:String:required
email:String:required:indexed
author:ObjectId:ref=User:required
createdAt:Date
active:Boolean
```

## Generated Files

For `npx express-mongo-scaffold generate model Product --fields "name:String:required,price:Number"`:

| File | Description |
|------|-------------|
| `models/Product.js` | Mongoose schema with validation and toJSON transform |
| `controllers/productController.js` | CRUD operations with pagination and error handling |
| `routes/productRoutes.js` | Express router with RESTful endpoints |

## Programmatic API

```javascript
import { renderAll, parseFieldsFlag, toPascalCase, toCamelCase, toRoutePath } from 'express-mongo-scaffold';

const fields = parseFieldsFlag('name:String:required,price:Number');
const config = {
  modelName: 'Product',
  varName: 'product',
  routePath: 'products',
  fields,
  timestamps: true,
};
```

### Exported API

| Export | Description |
|--------|-------------|
| `renderAll(templates, config)` | Render all three templates and return generated file objects |
| `renderTemplate(templateString, config)` | Render a single EJS template string |
| `parseFieldsFlag(flagValue)` | Parse a `--fields` flag string into `FieldDefinition[]` |
| `validateModelName(name)` | Validate a model name; returns `true` or an error string |
| `validateFieldName(name)` | Validate a field name; returns `true` or an error string |
| `validateRefName(name)` | Validate a `ref=` target name; returns `true` or an error string |
| `toPascalCase(str)` | Convert a string to PascalCase |
| `toCamelCase(str)` | Convert a string to camelCase |
| `pluralize(str)` | Naive English pluralization |
| `toRoutePath(modelName)` | Derive a lowercase plural route segment from a model name |

### Types

```typescript
type FieldType = 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId';

interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  indexed: boolean;
  ref?: string; // ObjectId fields only
}

interface ModelConfig {
  modelName: string;
  varName: string;
  routePath: string;
  fields: FieldDefinition[];
  timestamps: boolean;
}

interface GeneratedFile {
  filePath: string;
  content: string;
}
```

## License

MIT
