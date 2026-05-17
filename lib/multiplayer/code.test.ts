import { describe, it, expect } from 'vitest';
import { randomCode, generateUniqueCode } from './code';

describe('randomCode', () => {
  it('is 4 uppercase A–Z letters', () => {
    for (let i = 0; i < 50; i++) expect(randomCode()).toMatch(/^[A-Z]{4}$/);
  });
});

describe('generateUniqueCode', () => {
  it('returns the first code that does not collide', async () => {
    const code = await generateUniqueCode(async () => false);
    expect(code).toMatch(/^[A-Z]{4}$/);
  });

  it('retries past a collision then succeeds', async () => {
    let calls = 0;
    const code = await generateUniqueCode(async () => {
      calls += 1;
      return calls < 3; // first 2 collide, 3rd is free
    });
    expect(calls).toBe(3);
    expect(code).toMatch(/^[A-Z]{4}$/);
  });

  it('throws after exhausting maxAttempts', async () => {
    await expect(generateUniqueCode(async () => true, 5)).rejects.toThrow(
      /unique room code/,
    );
  });
});
