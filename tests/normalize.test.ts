import { describe, expect, it } from 'vitest';
import {
  OTHER_CITY_VALUE,
  fromBackendStateProvince,
  isListedCity,
  toBackendStateProvince,
} from '../src/normalize';

describe('toBackendStateProvince', () => {
  it('appends " District" when missing', () => {
    expect(toBackendStateProvince('Batticaloa')).toBe('Batticaloa District');
  });

  it('is idempotent when already suffixed', () => {
    expect(toBackendStateProvince('Batticaloa District')).toBe('Batticaloa District');
  });

  it('trims surrounding whitespace', () => {
    expect(toBackendStateProvince('  Batticaloa  ')).toBe('Batticaloa District');
  });

  it('returns empty string for empty input', () => {
    expect(toBackendStateProvince('')).toBe('');
    expect(toBackendStateProvince('   ')).toBe('');
  });
});

describe('fromBackendStateProvince', () => {
  it('strips the " District" suffix', () => {
    expect(fromBackendStateProvince('Batticaloa District')).toBe('Batticaloa');
  });

  it('is a no-op when there is no suffix', () => {
    expect(fromBackendStateProvince('Batticaloa')).toBe('Batticaloa');
  });

  it('handles null/undefined/empty input', () => {
    expect(fromBackendStateProvince(null)).toBe('');
    expect(fromBackendStateProvince(undefined)).toBe('');
    expect(fromBackendStateProvince('')).toBe('');
  });

  it('round-trips with toBackendStateProvince', () => {
    expect(fromBackendStateProvince(toBackendStateProvince('Gampaha'))).toBe('Gampaha');
  });
});

describe('isListedCity', () => {
  it('is true for a real city in its real district', () => {
    expect(isListedCity('Batticaloa', 'Kattankudi')).toBe(true);
  });

  it('is false for a real city looked up under the wrong district', () => {
    expect(isListedCity('Gampaha', 'Kattankudi')).toBe(false);
  });

  it('is false for an unlisted informal place name (Kallady)', () => {
    expect(isListedCity('Batticaloa', 'Kallady')).toBe(false);
  });

  it('is false for empty/whitespace/null/undefined city names', () => {
    expect(isListedCity('Batticaloa', '')).toBe(false);
    expect(isListedCity('Batticaloa', '   ')).toBe(false);
    expect(isListedCity('Batticaloa', null)).toBe(false);
    expect(isListedCity('Batticaloa', undefined)).toBe(false);
  });

  it('is case-insensitive on the city name', () => {
    expect(isListedCity('Batticaloa', 'kattankudi')).toBe(true);
    expect(isListedCity('Batticaloa', 'KATTANKUDI')).toBe(true);
  });
});

describe('OTHER_CITY_VALUE', () => {
  it('is a stable sentinel string for picker "Other" options', () => {
    expect(OTHER_CITY_VALUE).toBe('__other__');
  });
});
