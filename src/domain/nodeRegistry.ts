import type { NodeDefinition } from "./types";

export const nodeRegistry: NodeDefinition[] = [
  {
    type: "machine-profile",
    title: "Machine Profile",
    subtitle: "عرض، واحد و محدودیت دستگاه",
    tone: "source",
    inputs: [],
    outputs: [{ id: "artboard", label: "Artboard", valueKind: "document" }],
    capabilities: ["procedural", "print-critical", "batchable"],
    description:
      "مثل presetهای render/export در Blender، محدودیت فیزیکی دستگاه را به graph تزریق می‌کند.",
  },
  {
    type: "garment-block",
    title: "Garment Block",
    subtitle: "الگوی لباس و سایزبندی",
    tone: "source",
    inputs: [{ id: "machine", label: "Machine", valueKind: "document" }],
    outputs: [{ id: "shape", label: "Clip Shape", valueKind: "vector-shape" }],
    capabilities: ["procedural", "non-destructive", "print-critical"],
    description:
      "نقش الگوی پایه و grading را دارد؛ خروجی آن clipPath و guideهای اندازه واقعی است.",
  },
  {
    type: "svg-asset",
    title: "SVG Asset",
    subtitle: "موتیف وکتوری قابل لینک",
    tone: "source",
    inputs: [],
    outputs: [{ id: "svg", label: "Motif", valueKind: "svg-asset" }],
    capabilities: ["asset-linked", "cacheable", "batchable"],
    description:
      "مانند asset browser در Blender/Substance، فایل SVG را به سند لینک می‌کند بدون اینکه مسیرهای اصلی از بین بروند.",
  },
  {
    type: "pattern-tile",
    title: "Pattern Tile",
    subtitle: "تبدیل موتیف به کاشی تکرارشونده",
    tone: "transform",
    inputs: [
      { id: "motif", label: "Motif", valueKind: "svg-asset" },
      { id: "shape", label: "Clip Shape", valueKind: "vector-shape" },
    ],
    outputs: [{ id: "pattern", label: "SVG Pattern", valueKind: "pattern" }],
    capabilities: ["procedural", "non-destructive", "cacheable"],
    description:
      "الهام‌گرفته از Substance Designer: tile، offset، random seed و variation را غیرمخرب نگه می‌دارد.",
  },
  {
    type: "path-brush",
    title: "Path Brush",
    subtitle: "چیدن pattern روی مسیر",
    tone: "transform",
    inputs: [
      { id: "pattern", label: "Pattern", valueKind: "pattern" },
      { id: "shape", label: "Boundary Path", valueKind: "vector-shape" },
    ],
    outputs: [{ id: "brush", label: "Brush Stroke", valueKind: "brush" }],
    capabilities: ["procedural", "non-destructive", "cacheable"],
    description:
      "معادل پیشرفته Pattern Brush: فاصله، چرخش، alignment، corner strategy و start/end cap را کنترل می‌کند.",
  },
  {
    type: "diagnostics",
    title: "Print Diagnostics",
    subtitle: "کنترل ریسک تولید",
    tone: "analysis",
    inputs: [{ id: "document", label: "Document", valueKind: "document" }],
    outputs: [{ id: "report", label: "Report", valueKind: "document" }],
    capabilities: ["print-critical", "batchable"],
    description:
      "مثل inspection panel در نرم‌افزارهای حرفه‌ای، قبل از خروجی مشکلات scale، bleed، تداخل و استفاده از عرض دستگاه را گزارش می‌کند.",
  },
  {
    type: "export",
    title: "Export Queue",
    subtitle: "SVG/PDF برای چاپ",
    tone: "output",
    inputs: [{ id: "document", label: "Document", valueKind: "document" }],
    outputs: [{ id: "file", label: "Production File", valueKind: "document" }],
    capabilities: ["print-critical", "batchable", "cacheable"],
    description:
      "مانند render queue: چند سایز، چند colorway و چند عرض دستگاه را به خروجی قابل ردگیری تبدیل می‌کند.",
  },
];
