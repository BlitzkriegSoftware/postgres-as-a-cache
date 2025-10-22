import { getRandomInt } from './getRandomInt';

/**
 * Get random string
 * @param strLength {number} - of length
 * @returns {string} - random result
 */
export function getRandomString(strLength: number): string {
  const validChars: string =
    'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.';
  let result = '';
  for (let i = 0; i < strLength; i++) {
    const index = getRandomInt(0, validChars.length - 1);
    result = result + validChars.substring(index, index + 1);
  }
  return result;
}
