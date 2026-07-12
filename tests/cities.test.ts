import { describe, expect, it } from 'vitest';
import {
  getAllCities,
  getCitiesByDistrictId,
  getCitiesByDistrictName,
  getCitiesByProvinceId,
  getCitiesByPostcode,
  getCityById,
  searchCities,
  searchCitiesInDistrict,
} from '../src/cities';
import { getDistrictByName } from '../src/districts';
import { getProvinceByName } from '../src/provinces';

describe('getCitiesByDistrictName', () => {
  it('includes cities that belong to the district', () => {
    const names = getCitiesByDistrictName('Batticaloa').map((c) => c.name_en);
    expect(names).toContain('Kattankudi');
  });

  it('includes Wattala under Gampaha', () => {
    const names = getCitiesByDistrictName('Gampaha').map((c) => c.name_en);
    expect(names).toContain('Wattala');
  });

  it('does not leak cities from other districts', () => {
    const names = getCitiesByDistrictName('Batticaloa').map((c) => c.name_en);
    expect(names).not.toContain('Wattala');
  });

  it('is reachable directly by district name without selecting a province first', () => {
    // Regression guard: district-level lookups must not require a province argument.
    const byName = getCitiesByDistrictName('Batticaloa');
    const district = getDistrictByName('Batticaloa')!;
    const byId = getCitiesByDistrictId(district.id);
    expect(byName).toEqual(byId);
    expect(byName.length).toBeGreaterThan(0);
  });

  it('returns an empty array for an unknown district', () => {
    expect(getCitiesByDistrictName('Nowhereland')).toEqual([]);
  });

  it('is case-insensitive on the district name', () => {
    expect(getCitiesByDistrictName('BATTICALOA').length).toBe(
      getCitiesByDistrictName('Batticaloa').length,
    );
  });
});

describe('getCitiesByProvinceId', () => {
  it('aggregates cities across every district in the province', () => {
    const eastern = getProvinceByName('Eastern')!;
    const provinceCities = getCitiesByProvinceId(eastern.id).map((c) => c.name_en);
    const battiCities = getCitiesByDistrictName('Batticaloa').map((c) => c.name_en);
    for (const name of battiCities) {
      expect(provinceCities).toContain(name);
    }
  });
});

describe('searchCitiesInDistrict', () => {
  it('filters within the district by a partial, case-insensitive query', () => {
    const results = searchCitiesInDistrict('Batticaloa', 'kattan');
    expect(results.map((c) => c.name_en)).toContain('Kattankudi');
  });

  it('returns the full district list when the query is empty', () => {
    expect(searchCitiesInDistrict('Batticaloa', '')).toEqual(getCitiesByDistrictName('Batticaloa'));
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchCitiesInDistrict('Batticaloa', 'zzzznomatch')).toEqual([]);
  });
});

describe('searchCities (country-wide, no district/province required)', () => {
  it('finds a city by partial name across the whole country', () => {
    const results = searchCities('kattankudi');
    expect(results.map((c) => c.name_en)).toContain('Kattankudi');
  });

  it('finds a city by postcode fragment', () => {
    const results = searchCities('30100');
    expect(results.some((c) => c.name_en === 'Kattankudi')).toBe(true);
  });

  it('returns all cities when the query is empty', () => {
    expect(searchCities('')).toEqual(getAllCities());
  });

  it('respects the limit parameter', () => {
    expect(searchCities('', 5)).toHaveLength(5);
    expect(searchCities('a', 3)).toHaveLength(3);
  });

  it('treats limit 0 consistently whether or not a query is given', () => {
    expect(searchCities('', 0)).toEqual([]);
    expect(searchCities('kattankudi', 0)).toEqual([]);
  });
});

describe('getCitiesByPostcode', () => {
  it('finds cities sharing a postcode', () => {
    const results = getCitiesByPostcode('30100');
    expect(results.map((c) => c.name_en)).toContain('Kattankudi');
  });

  it('returns an empty array for an unknown postcode', () => {
    expect(getCitiesByPostcode('00000')).toEqual([]);
  });
});

describe('getCityById', () => {
  it('finds a known city', () => {
    expect(getCityById('301')?.name_en).toBe('Kattankudi');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCityById('not-a-real-id')).toBeUndefined();
  });
});

describe('Kallady exclusion (data source limitation, documented in README)', () => {
  it('is not present under any district', () => {
    for (const c of getAllCities()) {
      expect(c.name_en.toLowerCase()).not.toBe('kallady');
    }
  });
});
