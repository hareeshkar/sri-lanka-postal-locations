import { describe, expect, it } from 'vitest';
import { findNearestCities, getCityCoordinates, getDistanceKm } from '../src/geo';
import { getCityById } from '../src/cities';
import type { SriLankaCity } from '../src/types';

const blankCity = (overrides: Partial<SriLankaCity> = {}): SriLankaCity => ({
  id: '999999',
  district_id: '1',
  name_en: 'Test Town',
  name_si: '',
  name_ta: '',
  sub_name_en: null,
  sub_name_si: null,
  sub_name_ta: null,
  postcode: '00000',
  latitude: '',
  longitude: '',
  ...overrides,
});

describe('getCityCoordinates blank handling', () => {
  it('returns undefined for blank coordinates instead of 0,0', () => {
    // Number('') is 0, which is finite, so an unguarded parse would yield a point in the Atlantic.
    expect(getCityCoordinates(blankCity())).toBeUndefined();
  });

  it('returns undefined when only one coordinate is blank', () => {
    expect(getCityCoordinates(blankCity({ latitude: '7.1' }))).toBeUndefined();
  });

  it('parses real coordinates', () => {
    expect(getCityCoordinates(blankCity({ latitude: '7.21842790', longitude: '81.85411610' })))
      .toEqual({ latitude: 7.2184279, longitude: 81.8541161 });
  });
});

describe('getDistanceKm', () => {
  it('is zero for identical coordinates', () => {
    const point = { latitude: 7.2906, longitude: 80.6337 };
    expect(getDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('is symmetric', () => {
    const a = { latitude: 6.9271, longitude: 79.8612 }; // Colombo
    const b = { latitude: 9.6615, longitude: 80.0255 }; // Jaffna
    expect(getDistanceKm(a, b)).toBeCloseTo(getDistanceKm(b, a), 6);
  });

  it('gives a plausible distance between Colombo and Jaffna (~300km)', () => {
    const colombo = { latitude: 6.9271, longitude: 79.8612 };
    const jaffna = { latitude: 9.6615, longitude: 80.0255 };
    const distance = getDistanceKm(colombo, jaffna);
    expect(distance).toBeGreaterThan(250);
    expect(distance).toBeLessThan(350);
  });
});

describe('getCityCoordinates', () => {
  it('parses a city with valid lat/lon strings', () => {
    const city = getCityById('301')!; // Kattankudi
    expect(getCityCoordinates(city)).toEqual({ latitude: 7.6853695, longitude: 81.7260123 });
  });

  it('returns undefined for malformed coordinates', () => {
    const malformed = {
      id: 'x',
      district_id: '1',
      name_en: 'Test',
      name_si: '',
      name_ta: '',
      sub_name_en: null,
      sub_name_si: null,
      sub_name_ta: null,
      postcode: '00000',
      latitude: 'not-a-number',
      longitude: '80.0',
    };
    expect(getCityCoordinates(malformed)).toBeUndefined();
  });
});

describe('findNearestCities', () => {
  it('returns Kattankudi itself as the nearest match to its own coordinates', () => {
    const kattankudi = getCityById('301')!;
    const coords = getCityCoordinates(kattankudi)!;
    const [nearest] = findNearestCities(coords, 1);
    expect(nearest.city.name_en).toBe('Kattankudi');
    expect(nearest.distanceKm).toBeCloseTo(0, 5);
  });

  it('respects the limit parameter and returns results sorted by distance', () => {
    const kattankudi = getCityById('301')!;
    const coords = getCityCoordinates(kattankudi)!;
    const results = findNearestCities(coords, 5);
    expect(results).toHaveLength(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceKm).toBeGreaterThanOrEqual(results[i - 1].distanceKm);
    }
  });

  it('defaults to a single nearest result', () => {
    const results = findNearestCities({ latitude: 6.9271, longitude: 79.8612 });
    expect(results).toHaveLength(1);
  });

  it('returns an empty array when limit is 0', () => {
    expect(findNearestCities({ latitude: 6.9271, longitude: 79.8612 }, 0)).toEqual([]);
  });
});
