# Notice

This package's code (the TypeScript API, tests, and build tooling) is original
work by Hareeshkar Ravi, licensed under MIT (see `LICENSE`).

## Data attribution

The location data bundled in `src/data/` (`provinces.json`, `districts.json`,
`cities.json`) is **not original**. It is derived from:

- [madurapa/sri-lanka-provinces-districts-cities](https://github.com/madurapa/sri-lanka-provinces-districts-cities) —
  original dataset, MIT License, Copyright (c) 2016 Maduka Jayalath.
- [SKIDDOW/SriLankaCitiesDatabase](https://github.com/SKIDDOW/SriLankaCitiesDatabase) —
  packaged the above dataset as JSON, MIT License, Copyright (c) 2024 SKIDDOW.

Both upstream sources are MIT-licensed. Their full license texts (copyright
notice + permission notice, as MIT requires) are reproduced verbatim in
[`THIRD-PARTY-LICENSES.md`](./THIRD-PARTY-LICENSES.md). This package does
not claim government, official, or exclusive ownership of the underlying
data.

See the README's "Data attribution & limitations" section for known gaps in
the dataset (e.g. informal place names not covered by the postal-town list).
