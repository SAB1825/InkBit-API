import { randomBytes, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
export function generateApiKey(length: number = 32): string {
  return randomBytes(length).toString('hex');
}


export function generateAPIkeyId(): string {
  return uuidv4().toString();
}