import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('app shell scaffold', () => {
  it('contains brand name in app shell', () => {
    const file = readFileSync('components/app-shell.tsx', 'utf8');
    expect(file).toContain('NewsLoom');
  });
});
