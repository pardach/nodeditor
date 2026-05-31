import type { Edge, Node } from "@xyflow/react";
import { nodeRegistry } from "./nodeRegistry";
import type { DesignNodeData, GarmentSpec, VectorDocumentSnapshot } from "./types";

export type DesignNode = Node<DesignNodeData, "designNode">;

const graphPositions: Record<string, { x: number; y: number }> = {
  "machine-profile": { x: 0, y: 95 },
  "garment-block": { x: 300, y: 25 },
  "svg-asset": { x: 300, y: 290 },
  "pattern-tile": { x: 620, y: 155 },
  "path-brush": { x: 940, y: 155 },
  diagnostics: { x: 1260, y: 35 },
  export: { x: 1260, y: 285 },
};

export const graphEdges: Edge[] = [
  edge("machine-to-garment", "machine-profile", "garment-block"),
  edge("garment-to-pattern", "garment-block", "pattern-tile"),
  edge("asset-to-pattern", "svg-asset", "pattern-tile"),
  edge("pattern-to-brush", "pattern-tile", "path-brush"),
  edge("garment-to-brush", "garment-block", "path-brush"),
  edge("brush-to-diagnostics", "path-brush", "diagnostics"),
  edge("diagnostics-to-export", "diagnostics", "export"),
];

export function buildFlowNodes(
  spec: GarmentSpec,
  snapshot: VectorDocumentSnapshot,
): DesignNode[] {
  return nodeRegistry.map((definition) => ({
    id: definition.type,
    type: "designNode",
    position: graphPositions[definition.type],
    data: {
      title: definition.title,
      subtitle: subtitleFor(definition.type, spec, snapshot),
      tone: definition.tone,
      capabilities: definition.capabilities,
      items: itemsFor(definition.type, spec, snapshot, definition.description),
    },
  }));
}

function edge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    animated: true,
  };
}

function subtitleFor(type: string, spec: GarmentSpec, snapshot: VectorDocumentSnapshot) {
  switch (type) {
    case "machine-profile":
      return `${spec.artboardWidth} cm artboard`;
    case "garment-block":
      return `${spec.garmentWidth} × ${spec.garmentHeight} cm`;
    case "svg-asset":
      return `scale ${spec.motifScale.toFixed(1)}x / ${spec.colorways} colorways`;
    case "pattern-tile":
      return `${spec.repeatSize} cm tile / ${snapshot.analysis.estimatedTiles} tiles`;
    case "path-brush":
      return `${spec.brushSpacing} cm spacing / ${snapshot.analysis.brushCount} repeats`;
    case "diagnostics":
      return `${snapshot.analysis.exportReadiness}% ready`;
    case "export":
      return "SVG/PDF production queue";
    default:
      return "";
  }
}

function itemsFor(
  type: string,
  spec: GarmentSpec,
  snapshot: VectorDocumentSnapshot,
  description: string,
) {
  switch (type) {
    case "machine-profile":
      return [
        "پریست عرض دستگاه و واحد اندازه‌گیری",
        "قانون bleed، margin و registration",
        "ورودی batch برای چند عرض چاپ",
      ];
    case "garment-block":
      return [
        `یقه: ${spec.neckWidth} × ${spec.neckDrop} cm`,
        "clipPath پارامتریک و guideهای اندازه واقعی",
        "آماده اتصال به grading و جدول سایز",
      ];
    case "svg-asset":
      return [
        "لینک به فایل SVG و حفظ مسیرهای اصلی",
        "نسخه‌بندی asset مانند Blender Asset Browser",
        "تعریف palette و colorway بدون تخریب طرح",
      ];
    case "pattern-tile":
      return [
        "tile، offset، rotation و seed برای تکرار",
        "cache خروجی pattern برای viewport سریع",
        "رفتار غیرمخرب شبیه Substance graph",
      ];
    case "path-brush":
      return [
        "چیدمان موتیف روی یقه، لبه و مسیر دلخواه",
        "corner strategy، caps و alignment",
        "کنترل jitter برای حالت دست‌ساز و طبیعی",
      ];
    case "diagnostics":
      return snapshot.analysis.warnings.length
        ? snapshot.analysis.warnings
        : ["scale، bleed و ظرفیت آرت‌بورد معتبر هستند.", description];
    case "export":
      return [
        "صف خروجی برای چند سایز و چند colorway",
        "SVG/PDF با metadata دستگاه و واحد cm/mm",
        "قابل اتصال به RIP، naming rule و archive",
      ];
    default:
      return [description];
  }
}
