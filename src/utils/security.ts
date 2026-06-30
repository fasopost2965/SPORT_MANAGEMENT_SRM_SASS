/**
 * Security helper to compute SHA-256 hash of a string using Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a string is a 64-character SHA-256 hex hash.
 */
export function isHashed(text: string): boolean {
  return /^[a-f0-9]{64}$/i.test(text);
}
