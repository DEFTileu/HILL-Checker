const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomCode(len = 4): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

/**
 * Generate a code not already taken. `exists` returns true if the code is in
 * use. Retries up to `maxAttempts` times, then throws.
 */
export async function generateUniqueCode(
  exists: (code: string) => Promise<boolean>,
  maxAttempts = 5,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomCode();
    if (!(await exists(code))) return code;
  }
  throw new Error('Could not generate a unique room code');
}
