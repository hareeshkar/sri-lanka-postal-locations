import provincesData from './data/provinces.json';
import type { SriLankaProvince } from './types';

const provinceList = provincesData as SriLankaProvince[];

export const getProvinces = (): SriLankaProvince[] =>
  [...provinceList].sort((a, b) => a.name_en.localeCompare(b.name_en));

export const getProvinceById = (id: string): SriLankaProvince | undefined =>
  provinceList.find((p) => p.id === id);

export const getProvinceByName = (nameEn: string): SriLankaProvince | undefined =>
  provinceList.find((p) => p.name_en.toLowerCase() === nameEn.trim().toLowerCase());
