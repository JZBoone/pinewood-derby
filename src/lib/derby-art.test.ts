import { formatArtistName, isHexColor } from './derby-art';

describe('formatArtistName', () => {
  test('it keeps the first name and last initial', () => {
    expect(formatArtistName('James Miller')).toBe('James M.');
    expect(formatArtistName('  Mary Ann  van der berg ')).toBe('Mary B.');
  });

  test('it leaves a formatted name alone', () => {
    expect(formatArtistName('James M.')).toBe('James M.');
  });

  test('it handles a single name and blanks', () => {
    expect(formatArtistName('James')).toBe('James');
    expect(formatArtistName('   ')).toBe('');
  });
});

describe('isHexColor', () => {
  test('it accepts six-digit hex colors only', () => {
    expect(isHexColor('#132150')).toBe(true);
    expect(isHexColor('#13215')).toBe(false);
    expect(isHexColor('red')).toBe(false);
  });
});
