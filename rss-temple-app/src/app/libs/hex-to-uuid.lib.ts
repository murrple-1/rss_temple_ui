import { stringify } from 'uuid';

export function hexToUuid(hex: string): string {
  if (!/^(0x|0h)?[0-9A-F]+$/i.test(hex)) {
    throw new Error('not hexidecimal');
  }

  const bytes: number[] = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return stringify(bytes);
}
