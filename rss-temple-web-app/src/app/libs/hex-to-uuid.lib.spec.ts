import { hexToUuid } from './hex-to-uuid.lib';

describe('hex-to-uuid.lib', () => {
  it('should convert hex strings to UUID', () => {
    const uuid = hexToUuid('1d86a56d7f4d4bafb100f9cbcc534091');
    expect(uuid).toEqual('1d86a56d-7f4d-4baf-b100-f9cbcc534091');
  });

  it('should fail to parse non-hex strings', () => {
    expect(() => hexToUuid('yd86a56d7f4d4bafb100f9cbcc534091')).toThrowError(
      'not hexidecimal',
    );
  });

  it('should fail to parse malformed strings', () => {
    expect(() => hexToUuid('1d86a56d7f4d4bafb100f9cbcc53409')).toThrowError(
      'wrong length for hex UUID',
    );
    expect(() => hexToUuid('1d86a')).toThrowError('wrong length for hex UUID');
  });
});
