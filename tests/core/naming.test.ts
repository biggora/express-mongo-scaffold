import { describe, it, expect } from 'vitest';
import { toPascalCase, toCamelCase, pluralize, toRoutePath } from '../../src/core/naming.js';

describe('naming', () => {
  describe('toPascalCase', () => {
    it('capitalizes a single lowercase word', () => {
      expect(toPascalCase('user')).toBe('User');
    });

    it('joins hyphen-separated words into PascalCase', () => {
      expect(toPascalCase('blog-post')).toBe('BlogPost');
    });

    it('joins underscore-separated words into PascalCase', () => {
      expect(toPascalCase('my_model')).toBe('MyModel');
    });

    it('splits on camelCase boundaries', () => {
      expect(toPascalCase('blogPost')).toBe('BlogPost');
    });

    it('handles mixed separators and casing', () => {
      expect(toPascalCase('already-PascalCase')).toBe('AlreadyPascalCase');
    });

    it('returns empty string for empty input', () => {
      expect(toPascalCase('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(toPascalCase('   ')).toBe('');
    });

    it('capitalizes a single character', () => {
      expect(toPascalCase('a')).toBe('A');
    });

    it('joins space-separated words into PascalCase', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
    });

    it('normalizes all-caps input', () => {
      expect(toPascalCase('ABC')).toBe('Abc');
    });
  });

  describe('toCamelCase', () => {
    it('lowercases a capitalized word', () => {
      expect(toCamelCase('User')).toBe('user');
    });

    it('joins hyphen-separated words into camelCase', () => {
      expect(toCamelCase('blog-post')).toBe('blogPost');
    });

    it('converts PascalCase to camelCase', () => {
      expect(toCamelCase('BlogPost')).toBe('blogPost');
    });

    it('returns empty string for empty input', () => {
      expect(toCamelCase('')).toBe('');
    });

    it('lowercases a single character', () => {
      expect(toCamelCase('a')).toBe('a');
    });

    it('joins underscore-separated words into camelCase', () => {
      expect(toCamelCase('my_model')).toBe('myModel');
    });
  });

  describe('pluralize', () => {
    it('appends s for a standard word', () => {
      expect(pluralize('user')).toBe('users');
    });

    it('replaces trailing consonant+y with ies', () => {
      expect(pluralize('category')).toBe('categories');
    });

    it('appends es for words ending in x', () => {
      expect(pluralize('box')).toBe('boxes');
    });

    it('appends es for words ending in s', () => {
      expect(pluralize('bus')).toBe('buses');
    });

    it('appends es for words ending in ch', () => {
      expect(pluralize('match')).toBe('matches');
    });

    it('appends es for words ending in sh', () => {
      expect(pluralize('dish')).toBe('dishes');
    });

    it('appends es for words ending in z', () => {
      expect(pluralize('buzz')).toBe('buzzes');
    });

    it('appends s for words ending in vowel+y (day)', () => {
      expect(pluralize('day')).toBe('days');
    });

    it('appends s for words ending in vowel+y (key)', () => {
      expect(pluralize('key')).toBe('keys');
    });

    it('returns empty string for empty input', () => {
      expect(pluralize('')).toBe('');
    });
  });

  describe('toRoutePath', () => {
    it('lowercases and pluralizes a simple model name', () => {
      expect(toRoutePath('User')).toBe('users');
    });

    it('lowercases and pluralizes a compound PascalCase model name', () => {
      expect(toRoutePath('BlogPost')).toBe('blogposts');
    });

    it('lowercases and applies ies pluralization', () => {
      expect(toRoutePath('Category')).toBe('categories');
    });

    it('returns empty string for empty input', () => {
      expect(toRoutePath('')).toBe('');
    });
  });
});
