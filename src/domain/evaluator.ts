import type { ArtboardAnalysis, GarmentSpec, VectorDocumentSnapshot } from "./types";

export function evaluateDesign(spec: GarmentSpec): VectorDocumentSnapshot {
  const margin = 10;
  const viewBoxHeight = Math.max(spec.garmentHeight + margin * 2, 100);
  const printableArea = Math.round(spec.garmentWidth * spec.garmentHeight);
  const utilization = Math.round((spec.garmentWidth / spec.artboardWidth) * 100);
  const brushCount = Math.max(4, Math.floor(spec.garmentWidth / spec.brushSpacing));
  const estimatedTiles = Math.ceil(printableArea / Math.max(spec.repeatSize ** 2, 1));
  const warnings = collectWarnings(spec, utilization);
  const exportReadiness = Math.max(0, Math.min(100, 100 - warnings.length * 18));

  const analysis: ArtboardAnalysis = {
    viewBoxWidth: spec.artboardWidth,
    viewBoxHeight,
    printableArea,
    utilization,
    brushCount,
    estimatedTiles,
    exportReadiness,
    warnings,
  };

  return {
    version: 1,
    unit: "cm",
    spec,
    analysis,
  };
}

function collectWarnings(spec: GarmentSpec, utilization: number) {
  const warnings: string[] = [];

  if (spec.garmentWidth > spec.artboardWidth) {
    warnings.push("عرض لباس از عرض آرت‌بورد بزرگ‌تر است.");
  }

  if (utilization > 88) {
    warnings.push("فضای bleed و registration mark کم است.");
  }

  if (spec.neckWidth >= spec.garmentWidth * 0.55) {
    warnings.push("عرض یقه نسبت به عرض لباس بسیار زیاد است.");
  }

  if (spec.repeatSize < spec.brushSpacing * 0.7) {
    warnings.push("کاشی pattern از فاصله brush کوچک‌تر است و ممکن است تراکم زیاد شود.");
  }

  if (spec.colorways > 6) {
    warnings.push("تعداد colorway بالا است؛ بهتر است خروجی batch و naming rule تعریف شود.");
  }

  return warnings;
}
