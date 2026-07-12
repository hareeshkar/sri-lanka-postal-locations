import districtsData from './data/districts.json';
import type { SriLankaDistrict } from './types';

const districtList = districtsData as SriLankaDistrict[];

export const getDistricts = (): SriLankaDistrict[] =>
  [...districtList].sort((a, b) => a.name_en.localeCompare(b.name_en));

export const getDistrictById = (id: string): SriLankaDistrict | undefined =>
  districtList.find((d) => d.id === id);

export const getDistrictByName = (nameEn: string): SriLankaDistrict | undefined =>
  districtList.find((d) => d.name_en.toLowerCase() === nameEn.trim().toLowerCase());

export const getDistrictsByProvinceId = (provinceId: string): SriLankaDistrict[] =>
  districtList
    .filter((d) => d.province_id === provinceId)
    .sort((a, b) => a.name_en.localeCompare(b.name_en));
