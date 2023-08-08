import { SHA1 } from 'crypto-js';

export function hashPassword(password: string) {
  return `*${SHA1(SHA1(password)).toString().toUpperCase()}`;
}
