import { describe, expect, it } from 'vitest';
import districtsData from '../src/data/districts.json';
import citiesData from '../src/data/cities.json';
import type { SriLankaCity, SriLankaDistrict } from '../src/types';

/**
 * Regression tests against the Sri Lanka Post "Postal Code Directory" (2022 edition).
 * Each expectation below was checked by hand against the directory text and the
 * Colombo zone table. See data/changes-2022-directory.csv for the evidence line per row.
 */

const districts = districtsData as SriLankaDistrict[];
const cities = citiesData as SriLankaCity[];
const districtName = new Map(districts.map((d) => [d.id, d.name_en]));

const districtOf = (city: SriLankaCity): string | undefined => districtName.get(city.district_id);

describe('official register regressions (Sri Lanka Post 2022)', () => {
  // Each of these was wrong in the original data.
  const KNOWN_CONFLICTS: Array<[postcode: string, town: string, district: string]> = [
    ['80300', 'Ambalangoda', 'Galle'],
    ['61360', 'Kalpitiya', 'Puttalam'],
    ['51500', 'Medirigiriya', 'Polonnaruwa'],
    ['60140', 'Giriulla', 'Kurunegala'],
    ['60160', 'Pannala', 'Kurunegala'],
    ['81300', 'Hakmana', 'Matara'],
    ['70300', 'Rakwana', 'Ratnapura'],
    ['80510', 'Induruwa', 'Galle'],
    ['11650', 'Biyagama', 'Gampaha'],
    ['22080', 'Kotagala', 'Nuwara Eliya'],
    ['11710', 'Weliveriya', 'Gampaha'],
    ['10524', 'Handapangoda', 'Colombo'],
  ];

  it.each(KNOWN_CONFLICTS)('%s %s is in %s', (postcode, town, district) => {
    const match = cities.find((c) => c.postcode === postcode && c.name_en === town);
    expect(match, `no row for ${postcode} ${town}`).toBeDefined();
    expect(districtOf(match!)).toBe(district);
  });

  it('Colombo zone postcodes map to Colombo 01 to Colombo 15', () => {
    const zones: Record<string, string> = {
      '00100': 'Colombo 01', '00200': 'Colombo 02', '00300': 'Colombo 03',
      '00400': 'Colombo 04', '00500': 'Colombo 05', '00600': 'Colombo 06',
      '00700': 'Colombo 07', '00800': 'Colombo 08', '00900': 'Colombo 09',
      '01000': 'Colombo 10', '01100': 'Colombo 11', '01200': 'Colombo 12',
      '01300': 'Colombo 13', '01400': 'Colombo 14', '01500': 'Colombo 15',
    };
    for (const [postcode, label] of Object.entries(zones)) {
      const match = cities.find((c) => c.postcode === postcode && c.name_en === label);
      expect(match, `missing ${label} at ${postcode}`).toBeDefined();
      expect(districtOf(match!)).toBe('Colombo');
    }
  });

  it('Gandara (81170) and Hakmana (81300) are separate Matara post offices', () => {
    expect(cities.find((c) => c.postcode === '81170' && c.name_en === 'Gandara')).toBeDefined();
    expect(cities.find((c) => c.postcode === '81300' && c.name_en === 'Hakmana')).toBeDefined();
    expect(cities.find((c) => c.name_en === 'Gandara' && c.postcode === '81300')).toBeUndefined();
  });

  it('Meegoda (10504) and Handapangoda (10524) are separate Colombo post offices', () => {
    expect(cities.find((c) => c.postcode === '10504' && c.name_en === 'Meegoda')).toBeDefined();
    expect(cities.find((c) => c.postcode === '10524' && c.name_en === 'Handapangoda')).toBeDefined();
  });

  it('Katunayake IPZ is 11420 (the old FTZ label was wrong)', () => {
    const match = cities.find((c) => c.postcode === '11420');
    expect(match?.name_en).toBe('Katunayake IPZ');
    expect(match && districtOf(match)).toBe('Gampaha');
  });
});
