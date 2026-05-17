export type FuelType = "petrol" | "diesel" | "hybrid" | "ev";

export type OilSpec = {
  sae: string;
  standard: string;
  type: "Tam sintetik" | "Yarı sintetik" | "Mineral";
  capacityLiters: number;
};

export type ModelRule = {
  yearFrom: number;
  yearTo: number;
  fuel?: FuelType[];
  engineHint?: string;
  spec: OilSpec;
};

export type BrandEntry = {
  aliases: string[];
  defaultSpec: OilSpec;
  rules: ModelRule[];
};

const MB_LATEST: OilSpec = {
  sae: "0W-30",
  standard: "MB 229.71 / ACEA C5",
  type: "Tam sintetik",
  capacityLiters: 6.5
};

export const OIL_DATABASE: Record<string, BrandEntry> = {
  mercedes: {
    aliases: ["mercedes", "mercedes-benz", "mb", "benz"],
    defaultSpec: MB_LATEST,
    rules: [
      { yearFrom: 1995, yearTo: 2006, spec: { sae: "5W-40", standard: "MB 229.3 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2007, yearTo: 2014, spec: { sae: "5W-30", standard: "MB 229.5 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2015, yearTo: 2020, spec: { sae: "5W-30", standard: "MB 229.51 / 229.52 / ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2021, yearTo: 2099, spec: MB_LATEST }
    ]
  },
  bmw: {
    aliases: ["bmw"],
    defaultSpec: { sae: "0W-20", standard: "BMW LL-17FE+ / ACEA C5", type: "Tam sintetik", capacityLiters: 6.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2005, spec: { sae: "5W-40", standard: "BMW LL-98 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2006, yearTo: 2011, spec: { sae: "5W-30", standard: "BMW LL-04 / ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2012, yearTo: 2018, spec: { sae: "0W-30", standard: "BMW LL-04 / LL-12FE", type: "Tam sintetik", capacityLiters: 6.5 } },
      { yearFrom: 2019, yearTo: 2099, spec: { sae: "0W-20", standard: "BMW LL-17FE+ / ACEA C5", type: "Tam sintetik", capacityLiters: 6.5 } }
    ]
  },
  audi: {
    aliases: ["audi"],
    defaultSpec: { sae: "0W-20", standard: "VW 508 00 / 509 00", type: "Tam sintetik", capacityLiters: 5.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-40", standard: "VW 502.00 / 505.00", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2011, yearTo: 2018, spec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2019, yearTo: 2099, spec: { sae: "0W-20", standard: "VW 508 00 / 509 00", type: "Tam sintetik", capacityLiters: 5.5 } }
    ]
  },
  volkswagen: {
    aliases: ["volkswagen", "vw"],
    defaultSpec: { sae: "0W-20", standard: "VW 508 00 / 509 00", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-40", standard: "VW 502.00 / 505.00", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2011, yearTo: 2018, spec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2019, yearTo: 2099, spec: { sae: "0W-20", standard: "VW 508 00 / 509 00", type: "Tam sintetik", capacityLiters: 4.5 } }
    ]
  },
  skoda: {
    aliases: ["skoda", "škoda"],
    defaultSpec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-40", standard: "VW 502.00 / 505.00", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 4.5 } }
    ]
  },
  seat: {
    aliases: ["seat", "cupra"],
    defaultSpec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-40", standard: "VW 502.00 / 505.00", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "5W-30", standard: "VW 504.00 / 507.00", type: "Tam sintetik", capacityLiters: 4.5 } }
    ]
  },
  porsche: {
    aliases: ["porsche"],
    defaultSpec: { sae: "0W-40", standard: "Porsche C40 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 8.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2015, spec: { sae: "5W-40", standard: "Porsche A40 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 8.5 } },
      { yearFrom: 2016, yearTo: 2099, spec: { sae: "0W-40", standard: "Porsche C40 / ACEA A3/B4", type: "Tam sintetik", capacityLiters: 8.5 } }
    ]
  },
  toyota: {
    aliases: ["toyota"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2008, spec: { sae: "5W-30", standard: "API SL/SM / ILSAC GF-4", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2009, yearTo: 2016, spec: { sae: "5W-30", standard: "API SN / ILSAC GF-5", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2017, yearTo: 2099, spec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 } }
    ]
  },
  lexus: {
    aliases: ["lexus"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 5.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2008, spec: { sae: "5W-30", standard: "API SL/SM", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2009, yearTo: 2016, spec: { sae: "5W-30", standard: "API SN / ILSAC GF-5", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2017, yearTo: 2099, spec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 5.5 } }
    ]
  },
  honda: {
    aliases: ["honda"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.0 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-30", standard: "API SN / ILSAC GF-5", type: "Tam sintetik", capacityLiters: 4.0 } },
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.0 } }
    ]
  },
  acura: {
    aliases: ["acura"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  nissan: {
    aliases: ["nissan"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-30", standard: "API SN / ILSAC GF-5", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 } }
    ]
  },
  infiniti: {
    aliases: ["infiniti"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 5.0 },
    rules: []
  },
  mazda: {
    aliases: ["mazda"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  mitsubishi: {
    aliases: ["mitsubishi"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.3 },
    rules: []
  },
  subaru: {
    aliases: ["subaru"],
    defaultSpec: { sae: "0W-20", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 5.0 },
    rules: []
  },
  suzuki: {
    aliases: ["suzuki"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 3.5 },
    rules: []
  },
  hyundai: {
    aliases: ["hyundai"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 2015, yearTo: 2099, fuel: ["petrol"], spec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 } },
      { yearFrom: 2015, yearTo: 2099, fuel: ["diesel"], spec: { sae: "5W-30", standard: "ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 } }
    ]
  },
  kia: {
    aliases: ["kia"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 2015, yearTo: 2099, fuel: ["diesel"], spec: { sae: "5W-30", standard: "ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 } }
    ]
  },
  genesis: {
    aliases: ["genesis"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ILSAC GF-6A", type: "Tam sintetik", capacityLiters: 5.5 },
    rules: []
  },
  ford: {
    aliases: ["ford"],
    defaultSpec: { sae: "5W-20", standard: "Ford WSS-M2C946-B1 / API SP", type: "Tam sintetik", capacityLiters: 5.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2010, spec: { sae: "5W-30", standard: "Ford WSS-M2C913-C / API SN", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "5W-20", standard: "Ford WSS-M2C946-B1 / API SP", type: "Tam sintetik", capacityLiters: 5.5 } }
    ]
  },
  chevrolet: {
    aliases: ["chevrolet", "chevy"],
    defaultSpec: { sae: "5W-30", standard: "GM dexos1 Gen3 / API SP", type: "Tam sintetik", capacityLiters: 4.7 },
    rules: [
      { yearFrom: 2011, yearTo: 2099, spec: { sae: "5W-30", standard: "GM dexos1 Gen3 / API SP", type: "Tam sintetik", capacityLiters: 4.7 } }
    ]
  },
  cadillac: {
    aliases: ["cadillac"],
    defaultSpec: { sae: "0W-20", standard: "GM dexos1 Gen3 / API SP", type: "Tam sintetik", capacityLiters: 5.7 },
    rules: []
  },
  jeep: {
    aliases: ["jeep"],
    defaultSpec: { sae: "0W-20", standard: "MS-6395 / API SP", type: "Tam sintetik", capacityLiters: 5.7 },
    rules: []
  },
  dodge: {
    aliases: ["dodge", "ram", "chrysler"],
    defaultSpec: { sae: "5W-20", standard: "MS-6395 / API SP", type: "Tam sintetik", capacityLiters: 5.7 },
    rules: []
  },
  volvo: {
    aliases: ["volvo"],
    defaultSpec: { sae: "0W-20", standard: "Volvo VCC RBS0-2AE / ACEA C5", type: "Tam sintetik", capacityLiters: 5.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2014, spec: { sae: "5W-30", standard: "ACEA A5/B5", type: "Tam sintetik", capacityLiters: 5.5 } },
      { yearFrom: 2015, yearTo: 2099, spec: { sae: "0W-20", standard: "Volvo VCC RBS0-2AE / ACEA C5", type: "Tam sintetik", capacityLiters: 5.5 } }
    ]
  },
  jaguar: {
    aliases: ["jaguar"],
    defaultSpec: { sae: "5W-30", standard: "Jaguar STJLR.03.5005 / ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 },
    rules: []
  },
  landrover: {
    aliases: ["land rover", "landrover", "range rover", "range-rover"],
    defaultSpec: { sae: "0W-30", standard: "Jaguar/Land Rover STJLR.03.5006", type: "Tam sintetik", capacityLiters: 7.0 },
    rules: []
  },
  renault: {
    aliases: ["renault"],
    defaultSpec: { sae: "5W-30", standard: "Renault RN17 / ACEA C3", type: "Tam sintetik", capacityLiters: 4.8 },
    rules: []
  },
  peugeot: {
    aliases: ["peugeot"],
    defaultSpec: { sae: "0W-30", standard: "PSA B71 2312 / ACEA C2", type: "Tam sintetik", capacityLiters: 4.25 },
    rules: []
  },
  citroen: {
    aliases: ["citroen", "citroën"],
    defaultSpec: { sae: "0W-30", standard: "PSA B71 2312 / ACEA C2", type: "Tam sintetik", capacityLiters: 4.25 },
    rules: []
  },
  opel: {
    aliases: ["opel", "vauxhall"],
    defaultSpec: { sae: "5W-30", standard: "GM dexos2 / ACEA C3", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  fiat: {
    aliases: ["fiat"],
    defaultSpec: { sae: "5W-30", standard: "Fiat 9.55535-S1 / ACEA C3", type: "Tam sintetik", capacityLiters: 4.0 },
    rules: []
  },
  alfaromeo: {
    aliases: ["alfa romeo", "alfa-romeo", "alfaromeo"],
    defaultSpec: { sae: "0W-30", standard: "Fiat 9.55535-GS1 / ACEA C2", type: "Tam sintetik", capacityLiters: 5.0 },
    rules: []
  },
  mini: {
    aliases: ["mini", "mini cooper"],
    defaultSpec: { sae: "0W-30", standard: "BMW LL-04 / LL-12FE", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  changan: {
    aliases: ["changan"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C5", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  geely: {
    aliases: ["geely"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C3", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  byd: {
    aliases: ["byd"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C5", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: [
      { yearFrom: 1995, yearTo: 2099, fuel: ["ev"], spec: { sae: "—", standard: "Yağ tələb olunmur (tam elektrik)", type: "Tam sintetik", capacityLiters: 0 } }
    ]
  },
  haval: {
    aliases: ["haval", "great wall", "gwm"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C3", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  chery: {
    aliases: ["chery", "exeed", "omoda", "jaecoo"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C3", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  jac: {
    aliases: ["jac"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C3", type: "Tam sintetik", capacityLiters: 4.5 },
    rules: []
  },
  tank: {
    aliases: ["tank"],
    defaultSpec: { sae: "5W-30", standard: "API SP / ACEA C3", type: "Tam sintetik", capacityLiters: 6.5 },
    rules: []
  },
  tesla: {
    aliases: ["tesla"],
    defaultSpec: { sae: "—", standard: "Yağ tələb olunmur (tam elektrik)", type: "Tam sintetik", capacityLiters: 0 },
    rules: []
  }
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/š/g, "s")
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBrand(rawBrand: string): { key: string; entry: BrandEntry } | null {
  const needle = normalize(rawBrand);
  if (!needle) return null;
  for (const [key, entry] of Object.entries(OIL_DATABASE)) {
    for (const alias of entry.aliases) {
      const n = normalize(alias);
      if (needle === n || needle.startsWith(n + " ") || needle.endsWith(" " + n) || needle.includes(" " + n + " ")) {
        return { key, entry };
      }
    }
  }
  for (const [key, entry] of Object.entries(OIL_DATABASE)) {
    for (const alias of entry.aliases) {
      if (needle.includes(normalize(alias))) {
        return { key, entry };
      }
    }
  }
  return null;
}

export function pickSpec(entry: BrandEntry, year: number | null, fuel: FuelType | null): { spec: OilSpec; matched: "exact" | "default" } {
  if (year != null) {
    const candidates = entry.rules.filter((r) => year >= r.yearFrom && year <= r.yearTo);
    const withFuel = fuel ? candidates.find((r) => r.fuel?.includes(fuel)) : null;
    if (withFuel) return { spec: withFuel.spec, matched: "exact" };
    const withoutFuelFilter = candidates.find((r) => !r.fuel);
    if (withoutFuelFilter) return { spec: withoutFuelFilter.spec, matched: "exact" };
  }
  if (fuel === "ev") {
    return {
      spec: { sae: "—", standard: "Yağ tələb olunmur (tam elektrik)", type: "Tam sintetik", capacityLiters: 0 },
      matched: "exact"
    };
  }
  return { spec: entry.defaultSpec, matched: "default" };
}
