import * as CryptoJS from 'crypto-js';

export class HashUtils {
  static generateHash(value: string): string {
    return CryptoJS.SHA256(value).toString();
  }

  static compareHash(value: string, hash: string): boolean {
    const hashedValue = this.generateHash(value);
    return hashedValue === hash;
  }
}
