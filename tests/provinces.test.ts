import { describe, expect, it } from 'vitest';
import { getProvinces, getProvinceById, getProvinceByName } from '../src/provinces';

describe('getProvinces', () => {
  it('returns all 9 provinces sorted alphabetically', () => {
    const provinces = getProvinces();
    expect(provinces).toHaveLength(9);
    const names = provinces.map((p) => p.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe('getProvinceById', () => {
  it('finds a known province', () => {
    expect(getProvinceById('1')?.name_en).toBe('Western');
  });

  it('returns undefined for an unknown id', () => {
    expect(getProvinceById('999')).toBeUndefined();
  });
});

describe('getProvinceByName', () => {
  it('is case-insensitive and trims whitespace', () => {
    expect(getProvinceByName('  western ')?.id).toBe('1');
    expect(getProvinceByName('WESTERN')?.id).toBe('1');
  });

  it('returns undefined for an unknown name', () => {
    expect(getProvinceByName('Atlantis')).toBeUndefined();
  });
});
