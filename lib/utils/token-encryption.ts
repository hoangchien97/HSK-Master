/**
 * Token Encryption Library
 * AES-256-GCM encryption for Google Calendar refresh/access tokens
 * Tokens are encrypted server-side before storing in DB and never exposed to client.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM recommends 12, but 16 is also fine
const TAG_LENGTH = 16;
const SALT = 'ruby-hsk-calendar-token-salt'; // Static salt for key derivation

/**
 * Derive a 256-bit key from the env secret using scrypt
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.CALENDAR_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      '[TokenEncryption] Missing CALENDAR_TOKEN_SECRET env variable. ' +
      'Please set it to a random 32+ char string.'
    );
  }
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns: base64 encoded string of iv + authTag + ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted into a single base64 string
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex'),
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt an AES-256-GCM encrypted string
 * Input: base64 encoded string of iv + authTag + ciphertext
 */
export function decryptToken(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, 'base64');

  // Extract iv, authTag, and ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Safe decrypt — returns null if decryption fails (e.g. corrupted/wrong key)
 */
export function safeDecryptToken(encryptedBase64: string): string | null {
  try {
    return decryptToken(encryptedBase64);
  } catch (error) {
    console.error('[TokenEncryption] Decryption failed:', error);
    return null;
  }
}
