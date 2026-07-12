import citiesData from './data/cities.json';
import type { SriLankaCity } from './types';
import { getDistrictByName, getDistrictsByProvinceId } from './districts';

const cityList = citiesData as SriLankaCity[];

const sortByName = (cities: SriLankaCity[]): SriLankaCity[] =>
  [...cities].sort((a, b) => a.name_en.localeCompare(b.name_en));

export const getAllCities = (): SriLankaCity[] => sortByName(cityList);

export const getCitiesByDistrictId = (districtId: string): SriLankaCity[] =>
  sortByName(cityList.filter((c) => c.district_id === districtId));

export const getCitiesByDistrictName = (districtNameEn: string): SriLankaCity[] => {
  const district = getDistrictByName(districtNameEn);
  if (!district) return [];
  return getCitiesByDistrictId(district.id);
};

export const getCitiesByProvinceId = (provinceId: string): SriLankaCity[] => {
  const districtIds = new Set(getDistrictsByProvinceId(provinceId).map((d) => d.id));
  return sortByName(cityList.filter((c) => districtIds.has(c.district_id)));
};

export const searchCitiesInDistrict = (districtNameEn: string, query: string): SriLankaCity[] => {
  const trimmedQuery = query.trim().toLowerCase();
  const cities = getCitiesByDistrictName(districtNameEn);
  if (!trimmedQuery) return cities;
  return cities.filter((c) => c.name_en.toLowerCase().includes(trimmedQuery));
};

/** Country-wide typeahead search, not scoped to a district — matches name_en or postcode. */
export const searchCities = (query: string, limit?: number): SriLankaCity[] => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    const all = sortByName(cityList);
    return typeof limit === 'number' ? all.slice(0, limit) : all;
  }
  const matches = sortByName(
    cityList.filter(
      (c) => c.name_en.toLowerCase().includes(trimmedQuery) || c.postcode.includes(trimmedQuery),
    ),
  );
  return typeof limit === 'number' ? matches.slice(0, limit) : matches;
};

export const getCityById = (id: string): SriLankaCity | undefined =>
  cityList.find((c) => c.id === id);

export const getCitiesByPostcode = (postcode: string): SriLankaCity[] =>
  sortByName(cityList.filter((c) => c.postcode === postcode.trim()));
