import { describe, expect, it } from 'vitest';
import { getSnippet, isAbsoluteHttpUrl, stripHtml } from '../linkPreview';

describe('linkPreview helpers', () => {
  it('strips html and collapses whitespace', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('creates truncated snippets from html', () => {
    expect(getSnippet('<p>Hello world and more content</p>', 11)).toBe('Hello world...');
  });

  it('identifies absolute http urls', () => {
    expect(isAbsoluteHttpUrl('https://example.com/article')).toBe(true);
    expect(isAbsoluteHttpUrl('/notes/123')).toBe(false);
  });
});