import { describe, expect, it } from 'vitest';
import districtsData from '../src/data/districts.json';
import citiesData from '../src/data/cities.json';
import provincesData from '../src/data/provinces.json';
import type { SriLankaCity, SriLankaDistrict, SriLankaProvince } from '../src/types';

const districts = districtsData as SriLankaDistrict[];
const cities = citiesData as SriLankaCity[];
const provinces = provincesData as SriLankaProvince[];

describe('raw data integrity', () => {
  it('has the expected row counts', () => {
    expect(provinces).toHaveLength(9);
    expect(districts).toHaveLength(25);
    // 2170 original rows - 195 not confirmed by Sri Lanka Post (see data/unverified.csv)
    // + 162 post offices from the 2022 directory that were missing (see data/changes-2022-directory.csv)
    expect(cities).toHaveLength(2137);
  });

  it('has unique ids within each dataset', () => {
    expect(new Set(provinces.map((p) => p.id)).size).toBe(provinces.length);
    expect(new Set(districts.map((d) => d.id)).size).toBe(districts.length);
    expect(new Set(cities.map((c) => c.id)).size).toBe(cities.length);
  });

  it('every district references an existing province_id', () => {
    const provinceIds = new Set(provinces.map((p) => p.id));
    for (const d of districts) {
      expect(provinceIds.has(d.province_id), `district ${d.name_en} has orphan province_id ${d.province_id}`).toBe(true);
    }
  });

  it('every city references an existing district_id', () => {
    const districtIds = new Set(districts.map((d) => d.id));
    for (const c of cities) {
      expect(districtIds.has(c.district_id), `city ${c.name_en} has orphan district_id ${c.district_id}`).toBe(true);
    }
  });

  it('normalizes the "NULL" sentinel strings to real null', () => {
    for (const c of cities) {
      expect(c.sub_name_en).not.toBe('NULL');
      expect(c.sub_name_si).not.toBe('NULL');
      expect(c.sub_name_ta).not.toBe('NULL');
    }
  });

  it('every city has in-range Sri Lankan coordinates, or none at all', () => {
    // Post offices added from the government directory have no coordinates yet, so
    // latitude and longitude are both empty for them. Never half-filled, never 0,0.
    for (const c of cities) {
      const blank = c.latitude === '' && c.longitude === '';
      if (blank) continue;
      const lat = Number(c.latitude);
      const lon = Number(c.longitude);
      expect(c.latitude !== '' && c.longitude !== '', `city ${c.name_en} has one coordinate blank`).toBe(true);
      expect(Number.isFinite(lat), `city ${c.name_en} has non-numeric latitude`).toBe(true);
      expect(Number.isFinite(lon), `city ${c.name_en} has non-numeric longitude`).toBe(true);
      expect(lat).toBeGreaterThan(5);
      expect(lat).toBeLessThan(10);
      expect(lon).toBeGreaterThan(79);
      expect(lon).toBeLessThan(82);
    }
  });

  it('every city postcode is a 5-digit string (no NULL sentinels)', () => {
    for (const c of cities) {
      expect(c.postcode, `city ${c.name_en} (id ${c.id})`).toMatch(/^\d{5}$/);
    }
  });

  it('every city has a non-empty postcode', () => {
    for (const c of cities) {
      expect(c.postcode.trim().length).toBeGreaterThan(0);
    }
  });
});
