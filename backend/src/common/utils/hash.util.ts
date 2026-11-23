import * as argon2 from 'argon2';

/**
 * Hash Password Using Argon2
 * @param password [PASSWORD] Password want to hash
 * @returns [PASSWORD] Hashed Password
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
}

/**
 * Verify Password Using Argon2
 * @param hash [PASSWORD] Hash Password want to verify
 * @param password [PASSWORD] Password want to verify
 * @returns [PASSWORD] True if password is valid, false otherwise
 */
export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}
