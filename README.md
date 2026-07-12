# sri-lanka-postal-locations

[![npm version](https://img.shields.io/npm/v/sri-lanka-postal-locations.svg)](https://www.npmjs.com/package/sri-lanka-postal-locations)
[![CI](https://github.com/hareeshkar/sri-lanka-postal-locations/actions/workflows/ci.yml/badge.svg)](https://github.com/hareeshkar/sri-lanka-postal-locations/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Sri Lanka **provinces → districts → postal towns**, with `province_id` /
`district_id` linkage, coordinates, and postcodes — plus helpers for
location pickers, typeahead search, postcode/reverse-geocoding lookups, and
backend address normalization.

Zero runtime dependencies. ESM + CJS + TypeScript declarations. Works in
Node, browsers, and React Native.

**Why not an existing package?**
[`sri-lanka-postal-codes`](https://www.npmjs.com/package/sri-lanka-postal-codes)
has postal towns but no `district_id`, so you can't build a District → City
picker from it.
[`sri-lanka-locations`](https://www.npmjs.com/package/sri-lanka-locations)
has provinces/districts but no town/postcode/coordinate data. This package
covers the full hierarchy in one place.

---

## Table of contents

- [Install](#install)
- [Data model](#data-model)
- [The picker hierarchy](#the-picker-hierarchy-the-important-part)
- [Quick start](#quick-start)
- [Recipes](#recipes)
  - [Province → District → City picker (React)](#province--district--city-picker-react)
  - [Country-wide typeahead search](#country-wide-typeahead-search)
  - [Postcode lookup](#postcode-lookup)
  - [Reverse-geocode a GPS coordinate](#reverse-geocode-a-gps-coordinate)
  - [Storing/normalizing a district against a backend field](#storingnormalizing-a-district-against-a-backend-field)
  - [Validating a free-text city against a district](#validating-a-free-text-city-against-a-district)
- [API reference](#api-reference)
- [Data attribution & limitations](#data-attribution--limitations)
- [React Native](#react-native)
- [FAQ / troubleshooting](#faq--troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Install

```bash
npm install sri-lanka-postal-locations
# or
pnpm add sri-lanka-postal-locations
# or
yarn add sri-lanka-postal-locations
```

Requires Node.js >= 16 (or any modern bundler/RN/Expo target). No peer
dependencies.

## Data model

```text
Province (9)
  └─ District (25)         — district.province_id -> province.id
       └─ City (2170)      — city.district_id -> district.id
```

```ts
interface SriLankaProvince {
  id: string;
  name_en: string;
  name_si: string;
  name_ta: string;
}

interface SriLankaDistrict {
  id: string;
  province_id: string;
  name_en: string;
  name_si: string;
  name_ta: string;
}

interface SriLankaCity {
  id: string;
  district_id: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  sub_name_en: string | null; // real null, not the "NULL" string some forks ship
  sub_name_si: string | null;
  sub_name_ta: string | null;
  postcode: string;
  latitude: string;  // stringly-typed in the source data; parse with getCityCoordinates()
  longitude: string;
}
```

## The picker hierarchy (the important part)

Every level is an **independent entry point** — none of them require you to
have selected the level above first:

| If the user... | Call | Requires province selected? | Requires district selected? |
|---|---|---|---|
| picks a **province** | `getDistrictsByProvinceId(provinceId)` | — | no |
| picks a **district** directly | `getCitiesByDistrictName(nameEn)` / `getCitiesByDistrictId(id)` | **no** | — |
| searches/lists **cities** with nothing picked | `getAllCities()` / `searchCities(query)` | **no** | **no** |

So a UI can offer "browse by province," "jump straight to a district," and
"just search for my town" as three independent, always-available paths —
you never have to force a user through parent selections they don't need.

## Quick start

```ts
import {
  getProvinces,
  getDistrictsByProvinceId,
  getDistrictByName,
  getCitiesByDistrictName,
  searchCities,
  findNearestCities,
} from 'sri-lanka-postal-locations';

// Province -> its districts
const eastern = getProvinces().find((p) => p.name_en === 'Eastern')!;
getDistrictsByProvinceId(eastern.id);
// -> [{ name_en: 'Ampara', ... }, { name_en: 'Batticaloa', ... }, { name_en: 'Trincomalee', ... }]

// District -> its cities (no province selection needed)
getCitiesByDistrictName('Batticaloa');
// -> 42 postal towns, including Kattankudi

// Country-wide search, no district/province required
searchCities('kattan');
// -> matches by name_en or postcode fragment, anywhere in the country

// Reverse-geocode a raw GPS point to the nearest known postal town
findNearestCities({ latitude: 6.9271, longitude: 79.8612 }, 3);
// -> [{ city: {...}, distanceKm: 1.2 }, { city: {...}, distanceKm: 2.8 }, ...]
```

## Recipes

### Province → District → City picker (React)

```tsx
import { useMemo, useState } from 'react';
import {
  getProvinces,
  getDistrictsByProvinceId,
  getCitiesByDistrictId,
} from 'sri-lanka-postal-locations';

function LocationPicker() {
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  const provinces = useMemo(() => getProvinces(), []);
  // Empty until a province is picked -- but a district can also be reached
  // directly by rendering `getDistricts()` instead, if your UI skips this step.
  const districts = useMemo(
    () => (provinceId ? getDistrictsByProvinceId(provinceId) : []),
    [provinceId],
  );
  const cities = useMemo(
    () => (districtId ? getCitiesByDistrictId(districtId) : []),
    [districtId],
  );

  return (
    <>
      <select value={provinceId} onChange={(e) => { setProvinceId(e.target.value); setDistrictId(''); }}>
        <option value="">Select province</option>
        {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_en}</option>)}
      </select>

      <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!provinceId}>
        <option value="">Select district</option>
        {districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
      </select>

      <select disabled={!districtId}>
        <option value="">Select city</option>
        {cities.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
      </select>
    </>
  );
}
```

### Country-wide typeahead search

```ts
import { searchCities } from 'sri-lanka-postal-locations';

function onSearchInput(query: string) {
  // matches on name_en (substring) or postcode; capped to 10 results
  return searchCities(query, 10);
}
```

### Postcode lookup

```ts
import { getCitiesByPostcode } from 'sri-lanka-postal-locations';

getCitiesByPostcode('30100'); // -> [{ name_en: 'Kattankudi', ... }]
```

### Reverse-geocode a GPS coordinate

Useful as a free, offline fallback before (or instead of) calling an
external geocoding API — e.g. to prefill a district/postcode from a
device's GPS position.

```ts
import { findNearestCities, getCityCoordinates } from 'sri-lanka-postal-locations';

const [nearest] = findNearestCities({ latitude: 7.2906, longitude: 80.6337 });
console.log(nearest.city.name_en, nearest.distanceKm.toFixed(1), 'km away');

// getCityCoordinates() parses a city's stored string lat/lon safely
const coords = getCityCoordinates(nearest.city); // { latitude, longitude } or undefined
```

### Storing/normalizing a district against a backend field

If your backend stores the district as `"Batticaloa District"` but your UI
works with the bare district name:

```ts
import { toBackendStateProvince, fromBackendStateProvince } from 'sri-lanka-postal-locations';

toBackendStateProvince('Batticaloa');           // -> "Batticaloa District"
fromBackendStateProvince('Batticaloa District'); // -> "Batticaloa"
fromBackendStateProvince(user.stateProvince);    // safe with null/undefined -> ""
```

### Validating a free-text city against a district

For a picker with a free-text "Other" fallback:

```ts
import { isListedCity, OTHER_CITY_VALUE } from 'sri-lanka-postal-locations';

const cityValue = isListedCity('Batticaloa', formInput)
  ? formInput
  : OTHER_CITY_VALUE;
```

## API reference

### Provinces

| Function | Signature | Description |
|---|---|---|
| `getProvinces` | `() => SriLankaProvince[]` | All 9 provinces, sorted by `name_en`. |
| `getProvinceById` | `(id: string) => SriLankaProvince \| undefined` | Lookup by id. |
| `getProvinceByName` | `(nameEn: string) => SriLankaProvince \| undefined` | Case-insensitive, whitespace-trimmed lookup by English name. |

### Districts

| Function | Signature | Description |
|---|---|---|
| `getDistricts` | `() => SriLankaDistrict[]` | All 25 districts, sorted by `name_en`. |
| `getDistrictById` | `(id: string) => SriLankaDistrict \| undefined` | Lookup by id. |
| `getDistrictByName` | `(nameEn: string) => SriLankaDistrict \| undefined` | Case-insensitive, whitespace-trimmed lookup. |
| `getDistrictsByProvinceId` | `(provinceId: string) => SriLankaDistrict[]` | Districts within a province, sorted by `name_en`. Empty array for an unknown province id. |

### Cities

| Function | Signature | Description |
|---|---|---|
| `getAllCities` | `() => SriLankaCity[]` | Every postal town, no filter, sorted by `name_en`. |
| `getCitiesByDistrictId` | `(districtId: string) => SriLankaCity[]` | Cities in a district, by id. |
| `getCitiesByDistrictName` | `(districtNameEn: string) => SriLankaCity[]` | Cities in a district, by name — works with no province selected. |
| `getCitiesByProvinceId` | `(provinceId: string) => SriLankaCity[]` | Every city across every district in a province. |
| `searchCitiesInDistrict` | `(districtNameEn: string, query: string) => SriLankaCity[]` | Substring, case-insensitive typeahead scoped to one district. |
| `searchCities` | `(query: string, limit?: number) => SriLankaCity[]` | Country-wide typeahead by `name_en` substring or postcode substring. |
| `getCityById` | `(id: string) => SriLankaCity \| undefined` | Lookup by id. |
| `getCitiesByPostcode` | `(postcode: string) => SriLankaCity[]` | Reverse a postcode to its town(s) — a postcode can map to more than one town. |

### Geo

| Function | Signature | Description |
|---|---|---|
| `getCityCoordinates` | `(city: SriLankaCity) => Coordinates \| undefined` | Parses a city's string lat/lon into `{ latitude, longitude }` numbers; `undefined` if either value is missing or non-numeric. |
| `getDistanceKm` | `(a: Coordinates, b: Coordinates) => number` | Great-circle distance in kilometers (haversine formula). |
| `findNearestCities` | `(coords: Coordinates, limit?: number) => NearestCityResult[]` | Nearest postal town(s) to a coordinate, ascending by distance. Defaults to 1 result. |

### Address normalization

| Function | Signature | Description |
|---|---|---|
| `toBackendStateProvince` | `(districtNameEn: string) => string` | `"Batticaloa"` → `"Batticaloa District"`. Idempotent; empty string in → empty string out. |
| `fromBackendStateProvince` | `(stateProvince?: string \| null) => string` | Inverse of the above. Null/undefined-safe. |
| `isListedCity` | `(districtNameEn: string, cityName?: string \| null) => boolean` | Whether `cityName` is a known postal town within `districtNameEn`. Null/undefined/empty-safe. |
| `OTHER_CITY_VALUE` | `'__other__'` | Stable sentinel for an "Other" picker option. |

## Data attribution & limitations

The bundled data is not original — it traces to
[madurapa/sri-lanka-provinces-districts-cities](https://github.com/madurapa/sri-lanka-provinces-districts-cities),
packaged as JSON by
[SKIDDOW/SriLankaCitiesDatabase](https://github.com/SKIDDOW/SriLankaCitiesDatabase).
Both upstream sources are MIT-licensed — see [`NOTICE.md`](./NOTICE.md) for
full attribution.

- This is a **postal-town list**, not a complete list of informal suburbs
  or neighborhoods. For example `Kallady`, a Batticaloa suburb, is not
  listed as its own row — only its containing postal town is. Check
  `isListedCity()` and fall back to `OTHER_CITY_VALUE` for free-text input.
- **Not official government GIS data** — do not use for legal/administrative
  boundary determinations.
- Coordinates are **town centroids**, not street-level addresses.
- This package does **not** fetch data at runtime; everything is bundled at
  build time, so it works fully offline and has predictable versioning.

## React Native

Pure data + pure functions, no native modules, no DOM/Node-only APIs — works
unmodified with React Native and Expo:

```bash
npm install sri-lanka-postal-locations
```

```ts
import { getDistricts, getCitiesByDistrictName } from 'sri-lanka-postal-locations';
```

## FAQ / troubleshooting

**Why are `latitude`/`longitude` strings instead of numbers?**
That's how the source dataset ships them, and some consumers want to
control precision/formatting themselves. Use `getCityCoordinates(city)` to
get parsed, validated numbers.

**A postcode returns more than one city — is that a bug?**
No. Sri Lankan postcodes are shared by multiple postal towns in some cases;
`getCitiesByPostcode` returns all of them.

**My town isn't in the data.**
See [Data attribution & limitations](#data-attribution--limitations) — this
is a postal-town list, not every informal place name. Open an issue with
the town name, nearest postal town, and district if you'd like it tracked.

**Does this make network requests?**
No. All data is bundled at build time; there is no runtime fetch and no
telemetry.

## Contributing

Issues and PRs welcome — especially data corrections (with a source) and
additional derived helpers. Please don't submit informal/unverified place
names without a reference (e.g. a government postal code list).

```bash
git clone https://github.com/hareeshkar/sri-lanka-postal-locations.git
cd sri-lanka-postal-locations
npm install
npm test
npm run build
```

## License

MIT for the code (see [`LICENSE`](./LICENSE)). See
[`NOTICE.md`](./NOTICE.md) for the underlying data's attribution.
