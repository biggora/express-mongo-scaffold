/**
 * Converts an arbitrary string to PascalCase.
 *
 * Splitting rules (applied in order):
 * 1. Split on sequences of non-alphanumeric characters (e.g. hyphens, underscores, spaces).
 * 2. Split on camelCase boundaries — an uppercase letter immediately preceded by a lowercase letter.
 *
 * Each resulting segment has its first character uppercased and the remainder lowercased,
 * then all segments are joined without a separator.
 *
 * @param str - The input string to transform.
 * @returns The PascalCase representation, or an empty string for blank input.
 *
 * @example
 * toPascalCase('blog-post')  // 'BlogPost'
 * toPascalCase('user')       // 'User'
 * toPascalCase('blogPost')   // 'BlogPost'
 * toPascalCase('my_model')   // 'MyModel'
 * toPascalCase('')           // ''
 */
export function toPascalCase(str: string): string {
  if (!str.trim()) return '';

  // Insert a separator before camelCase boundaries so 'blogPost' becomes 'blog Post'.
  const withBoundaries = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Split on non-alphanumeric character sequences (covers hyphens, underscores, spaces, etc.).
  const segments = withBoundaries.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  return segments
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts an arbitrary string to camelCase.
 *
 * Delegates to {@link toPascalCase} then lowercases the first character.
 *
 * @param str - The input string to transform.
 * @returns The camelCase representation, or an empty string for blank input.
 *
 * @example
 * toCamelCase('blog-post')  // 'blogPost'
 * toCamelCase('User')       // 'user'
 * toCamelCase('')           // ''
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  if (!pascal) return '';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Produces a naive English plural form of a word.
 *
 * Rules applied in order:
 * 1. Ends in `s`, `x`, `z`, `ch`, or `sh` → append `"es"`.
 * 2. Ends in a consonant followed by `y` → replace the trailing `y` with `"ies"`.
 * 3. Otherwise → append `"s"`.
 *
 * @param str - A singular English word.
 * @returns The pluralised word, or an empty string for blank input.
 *
 * @example
 * pluralize('user')      // 'users'
 * pluralize('category')  // 'categories'
 * pluralize('box')       // 'boxes'
 * pluralize('bus')       // 'buses'
 * pluralize('status')    // 'statuses'
 * pluralize('')          // ''
 */
export function pluralize(str: string): string {
  if (!str) return '';

  if (/(?:s|x|z|ch|sh)$/i.test(str)) {
    return str + 'es';
  }

  // Consonant + y → ies  (vowel + y, e.g. 'day', falls through to the default 's')
  if (/[^aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + 'ies';
  }

  return str + 's';
}

/**
 * Derives a URL route path from a model name.
 *
 * Lowercases the model name then passes it through {@link pluralize}.
 *
 * @param modelName - A PascalCase or arbitrary model name.
 * @returns A lowercase plural string suitable for use as an Express route segment.
 *
 * @example
 * toRoutePath('User')      // 'users'
 * toRoutePath('BlogPost')  // 'blogposts'
 * toRoutePath('Category')  // 'categories'
 */
export function toRoutePath(modelName: string): string {
  return pluralize(modelName.toLowerCase());
}
