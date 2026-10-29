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
[`THIRD-PARTY-LICENSES.md`](./THIRD-PARTY-LICENSES.md).

### Postcodes, post-office names and districts

The postcodes, post-office names, and district assignments in `cities.json`
were reconciled against the official government source:

- Sri Lanka Post, *Postal Code Directory* (2022 edition), including its
  scanned legend and Colombo zone table.
- Sri Lanka Post postcode search (`slpost.gov.lk`), used as a second
  government source.

Every corrected row cites its evidence in
[`data/changes-2022-directory.csv`](./data/changes-2022-directory.csv).
Rows that no government source confirmed are excluded and listed in
[`data/unverified.csv`](./data/unverified.csv).

Version 1.0.0 contained the uncorrected data. The changes, the removed rows,
and what to update in existing code are described in the README section
"Upgrading from 1.0.0: data corrections".

This package is not affiliated with or endorsed by Sri Lanka Post or any
government body. The data reflects the 2022 directory and may not match
later postcode changes.

See the README's "Data attribution & limitations" section for known gaps in
the dataset (e.g. informal place names not covered by the postal-town list).
