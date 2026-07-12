import { describe, expect, it } from 'vitest';
import {
  getDistricts,
  getDistrictById,
  getDistrictByName,
  getDistrictsByProvinceId,
} from '../src/districts';
import { getProvinceByName } from '../src/provinces';

describe('getDistricts', () => {
  it('returns all 25 districts sorted alphabetically', () => {
    const districts = getDistricts();
    expect(districts).toHaveLength(25);
    const names = districts.map((d) => d.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe('getDistrictById', () => {
  it('finds Batticaloa by id', () => {
    expect(getDistrictById('4')?.name_en).toBe('Batticaloa');
  });

  it('returns undefined for an unknown id', () => {
    expect(getDistrictById('does-not-exist')).toBeUndefined();
  });
});

describe('getDistrictByName', () => {
  it('is case-insensitive and trims whitespace', () => {
    expect(getDistrictByName('  batticaloa ')?.id).toBe('4');
    expect(getDistrictByName('BATTICALOA')?.id).toBe('4');
  });

  it('returns undefined for an unknown district name', () => {
    expect(getDistrictByName('Nowhereland')).toBeUndefined();
  });
});

describe('getDistrictsByProvinceId', () => {
  it('works standalone, without requiring a province lookup elsewhere first', () => {
    const eastern = getProvinceByName('Eastern');
    expect(eastern).toBeDefined();
    const districts = getDistrictsByProvinceId(eastern!.id);
    const names = districts.map((d) => d.name_en);
    expect(names).toContain('Batticaloa');
    expect(names).toContain('Ampara');
    expect(names).toContain('Trincomalee');
    expect(names).not.toContain('Gampaha');
  });

  it('returns an empty array for an unknown province id', () => {
    expect(getDistrictsByProvinceId('999')).toEqual([]);
  });
});
