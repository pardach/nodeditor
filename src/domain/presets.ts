import type { GarmentSpec } from "./types";

export const artboardPresets = [60, 90, 105, 160, 180] as const;

export const initialSpec: GarmentSpec = {
  artboardWidth: 160,
  garmentWidth: 58,
  garmentHeight: 82,
  neckWidth: 18,
  neckDrop: 9,
  repeatSize: 12,
  brushSpacing: 8,
  motifScale: 1,
  scatterJitter: 0.35,
  colorways: 3,
};

export const machineProfiles = [
  {
    width: 60,
    label: "Sample printer",
    useCase: "نمونه‌گیری و تست رنگ",
  },
  {
    width: 90,
    label: "Small roll",
    useCase: "لباس کودک و قطعات کوچک",
  },
  {
    width: 105,
    label: "Standard apparel",
    useCase: "تی‌شرت و الگوی نیم‌تنه",
  },
  {
    width: 160,
    label: "Wide textile",
    useCase: "چیدمان کامل لباس و رول پارچه",
  },
  {
    width: 180,
    label: "Oversized textile",
    useCase: "پارچه عریض و چند سایز هم‌زمان",
  },
] as const;
