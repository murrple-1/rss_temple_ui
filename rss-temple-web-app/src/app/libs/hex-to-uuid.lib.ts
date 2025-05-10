import { stringify as uuidStringify } from 'uuid';

export function hexToUuid(hex: string): string {
  if (!/^(0x|0h)?[0-9A-F]+$/i.test(hex)) {
    throw new Error('not hexidecimal');
  }

  if (hex.length !== 32) {
    throw new Error('wrong length for hex UUID');
  }

  const bytes: number[] = [];
  for (let c = 0; c < 32; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }

  return uuidStringify(Uint8Array.from(bytes));
}
