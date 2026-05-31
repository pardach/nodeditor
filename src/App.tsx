import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type NodeTone = "source" | "transform" | "preview" | "output";

type DesignNodeData = {
  title: string;
  subtitle: string;
  items: string[];
  tone: NodeTone;
};

type DesignNode = Node<DesignNodeData, "designNode">;

type GarmentSpec = {
  artboardWidth: number;
  garmentWidth: number;
  garmentHeight: number;
  neckWidth: number;
  neckDrop: number;
  repeatSize: number;
  brushSpacing: number;
  motifScale: number;
};

const artboardPresets = [60, 90, 105, 160, 180];

const initialSpec: GarmentSpec = {
  artboardWidth: 160,
  garmentWidth: 58,
  garmentHeight: 82,
  neckWidth: 18,
  neckDrop: 9,
  repeatSize: 12,
  brushSpacing: 8,
  motifScale: 1,
};

const nodeTypes = {
  designNode: DesignNodeCard,
};

const edges: Edge[] = [
  {
    id: "machine-to-garment",
    source: "machine",
    target: "garment",
    animated: true,
  },
  {
    id: "garment-to-repeat",
    source: "garment",
    target: "repeat",
    animated: true,
  },
  {
    id: "motif-to-repeat",
    source: "motif",
    target: "repeat",
    animated: true,
  },
  {
    id: "repeat-to-brush",
    source: "repeat",
    target: "brush",
    animated: true,
  },
  {
    id: "brush-to-output",
    source: "brush",
    target: "output",
    animated: true,
  },
];

function App() {
  const [spec, setSpec] = useState<GarmentSpec>(initialSpec);

  const nodes = useMemo<DesignNode[]>(
    () => [
      {
        id: "machine",
        type: "designNode",
        position: { x: 0, y: 72 },
        data: {
          title: "عرض دستگاه چاپ",
          subtitle: `${spec.artboardWidth} cm roll / artboard`,
          tone: "source",
          items: [
            "پریست برای عرض‌های رایج",
            "ساخت خودکار آرت‌بورد",
            "قابل توسعه برای چند دستگاه",
          ],
        },
      },
      {
        id: "garment",
        type: "designNode",
        position: { x: 280, y: 30 },
        data: {
          title: "الگوی لباس",
          subtitle: `${spec.garmentWidth} × ${spec.garmentHeight} cm`,
          tone: "source",
          items: [
            `یقه: ${spec.neckWidth} × ${spec.neckDrop} cm`,
            "مبنای clipPath برای SVG",
            "آماده اتصال به فایل‌های سایزبندی",
          ],
        },
      },
      {
        id: "motif",
        type: "designNode",
        position: { x: 280, y: 260 },
        data: {
          title: "موتیف SVG",
          subtitle: `scale ${spec.motifScale.toFixed(1)}x`,
          tone: "source",
          items: [
            "جایگزین‌پذیر با فایل SVG",
            "ورودی pattern brush",
            "حفظ مسیرهای وکتور برای چاپ",
          ],
        },
      },
      {
        id: "repeat",
        type: "designNode",
        position: { x: 590, y: 145 },
        data: {
          title: "Pattern Make",
          subtitle: `repeat tile ${spec.repeatSize} cm`,
          tone: "transform",
          items: [
            "تولید کاشی تکرارشونده",
            "کنترل فاصله، مقیاس و offset",
            "خروجی native SVG pattern",
          ],
        },
      },
      {
        id: "brush",
        type: "designNode",
        position: { x: 900, y: 145 },
        data: {
          title: "Pattern Brush",
          subtitle: `spacing ${spec.brushSpacing} cm`,
          tone: "preview",
          items: [
            "مرزبندی روی یقه و لبه لباس",
            "نمایش تکرار موتیف روی مسیر",
            "پایه برای stroke-driven brush",
          ],
        },
      },
      {
        id: "output",
        type: "designNode",
        position: { x: 1210, y: 145 },
        data: {
          title: "خروجی چاپ",
          subtitle: "SVG artboard preview",
          tone: "output",
          items: [
            "قابل ارسال به RIP/Plotter",
            "حفظ نسبت اندازه‌ها",
            "مسیر توسعه برای export PDF/SVG",
          ],
        },
      },
    ],
    [spec],
  );

  const updateSpec = (key: keyof GarmentSpec, value: number) => {
    setSpec((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Node Pattern Studio</p>
          <h1>نمونه اولیه طراحی نودی برای الگوهای چاپ لباس</h1>
          <p className="hero-copy">
            این MVP نشان می‌دهد چگونه منطق‌هایی شبیه Houdini، Substance
            Designer و ابزارهای Pattern Brush / Pattern Make در Illustrator
            می‌توانند در یک محصول React برای طراحی SVG روی آرت‌بوردهای چاپی
            پیاده شوند.
          </p>
        </div>
        <div className="hero-card">
          <span>خروجی هدف</span>
          <strong>SVG + اندازه واقعی</strong>
          <small>آرت‌بورد قابل تنظیم برای عرض دستگاه‌های مختلف چاپ</small>
        </div>
      </section>

      <section className="workspace-grid">
        <ControlPanel spec={spec} updateSpec={updateSpec} />

        <section className="designer-surface">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Graph</p>
              <h2>جریان نودی طراحی</h2>
            </div>
            <span>{nodes.length} node</span>
          </div>

          <div className="flow-frame" dir="ltr">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.35}
              maxZoom={1.1}
              nodesDraggable
            >
              <Background />
              <MiniMap pannable zoomable />
              <Controls />
            </ReactFlow>
          </div>

          <div className="preview-grid">
            <SvgArtboard spec={spec} />
            <OutputChecklist spec={spec} />
          </div>
        </section>
      </section>
    </main>
  );
}

function DesignNodeCard({ data }: NodeProps<DesignNode>) {
  return (
    <article className={`design-node design-node--${data.tone}`} dir="rtl">
      <Handle type="target" position={Position.Left} />
      <div>
        <span>{data.subtitle}</span>
        <h3>{data.title}</h3>
      </div>
      <ul>
        {data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Handle type="source" position={Position.Right} />
    </article>
  );
}

type ControlPanelProps = {
  spec: GarmentSpec;
  updateSpec: (key: keyof GarmentSpec, value: number) => void;
};

function ControlPanel({ spec, updateSpec }: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Inputs</p>
          <h2>تنظیمات طراحی</h2>
        </div>
      </div>

      <label className="field">
        <span>عرض دستگاه / آرت‌بورد</span>
        <select
          value={spec.artboardWidth}
          onChange={(event) => updateSpec("artboardWidth", Number(event.target.value))}
        >
          {artboardPresets.map((width) => (
            <option key={width} value={width}>
              {width} cm
            </option>
          ))}
        </select>
      </label>

      <RangeField
        label="عرض لباس"
        value={spec.garmentWidth}
        min={32}
        max={120}
        unit="cm"
        onChange={(value) => updateSpec("garmentWidth", value)}
      />
      <RangeField
        label="قد لباس"
        value={spec.garmentHeight}
        min={45}
        max={140}
        unit="cm"
        onChange={(value) => updateSpec("garmentHeight", value)}
      />
      <RangeField
        label="عرض یقه"
        value={spec.neckWidth}
        min={8}
        max={36}
        unit="cm"
        onChange={(value) => updateSpec("neckWidth", value)}
      />
      <RangeField
        label="افت یقه"
        value={spec.neckDrop}
        min={4}
        max={24}
        unit="cm"
        onChange={(value) => updateSpec("neckDrop", value)}
      />
      <RangeField
        label="اندازه کاشی Pattern Make"
        value={spec.repeatSize}
        min={6}
        max={28}
        unit="cm"
        onChange={(value) => updateSpec("repeatSize", value)}
      />
      <RangeField
        label="فاصله Pattern Brush"
        value={spec.brushSpacing}
        min={4}
        max={18}
        unit="cm"
        onChange={(value) => updateSpec("brushSpacing", value)}
      />
      <RangeField
        label="مقیاس موتیف SVG"
        value={spec.motifScale}
        min={0.6}
        max={2}
        step={0.1}
        unit="x"
        onChange={(value) => updateSpec("motifScale", value)}
      />
    </aside>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
};

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: RangeFieldProps) {
  return (
    <label className="field">
      <span>
        {label}
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SvgArtboard({ spec }: { spec: GarmentSpec }) {
  const margin = 10;
  const viewBoxWidth = spec.artboardWidth;
  const viewBoxHeight = Math.max(spec.garmentHeight + margin * 2, 100);
  const garmentX = (viewBoxWidth - spec.garmentWidth) / 2;
  const garmentY = margin;
  const neckX = viewBoxWidth / 2;
  const neckY = garmentY;
  const neckRadiusX = spec.neckWidth / 2;
  const neckRadiusY = spec.neckDrop;
  const patternSize = spec.repeatSize;
  const motif = 2.6 * spec.motifScale;
  const brushCount = Math.max(4, Math.floor(spec.garmentWidth / spec.brushSpacing));

  const garmentPath = [
    `M ${garmentX} ${garmentY}`,
    `H ${neckX - neckRadiusX}`,
    `C ${neckX - neckRadiusX * 0.65} ${garmentY + neckRadiusY}`,
    `${neckX + neckRadiusX * 0.65} ${garmentY + neckRadiusY}`,
    `${neckX + neckRadiusX} ${garmentY}`,
    `H ${garmentX + spec.garmentWidth}`,
    `L ${garmentX + spec.garmentWidth - 5} ${garmentY + spec.garmentHeight}`,
    `H ${garmentX + 5}`,
    "Z",
  ].join(" ");

  return (
    <article className="canvas-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">SVG Canvas</p>
          <h2>پیش‌نمایش آرت‌بورد و الگو</h2>
        </div>
        <span>
          {spec.artboardWidth} × {Math.round(viewBoxHeight)} cm
        </span>
      </div>

      <svg
        className="artboard-svg"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        role="img"
        aria-label="پیش‌نمایش SVG الگوی لباس روی آرت‌بورد چاپ"
      >
        <defs>
          <pattern
            id="motif-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width={patternSize} height={patternSize} fill="#fff7ed" />
            <circle
              cx={patternSize * 0.35}
              cy={patternSize * 0.35}
              r={motif}
              fill="#f97316"
              opacity="0.86"
            />
            <path
              d={`M ${patternSize * 0.58} ${patternSize * 0.22} C ${patternSize * 0.86} ${patternSize * 0.3}, ${patternSize * 0.82} ${patternSize * 0.72}, ${patternSize * 0.52} ${patternSize * 0.78}`}
              fill="none"
              stroke="#0f766e"
              strokeLinecap="round"
              strokeWidth="0.9"
            />
            <path
              d={`M ${patternSize * 0.16} ${patternSize * 0.82} L ${patternSize * 0.34} ${patternSize * 0.66} L ${patternSize * 0.46} ${patternSize * 0.86}`}
              fill="none"
              stroke="#7c3aed"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.8"
            />
          </pattern>
          <clipPath id="garment-clip">
            <path d={garmentPath} />
          </clipPath>
        </defs>

        <rect width={viewBoxWidth} height={viewBoxHeight} rx="2" fill="#f8fafc" />
        {artboardPresets
          .filter((width) => width < spec.artboardWidth)
          .map((width) => (
            <line
              key={width}
              x1={width}
              x2={width}
              y1="0"
              y2={viewBoxHeight}
              stroke="#cbd5e1"
              strokeDasharray="1.5 1.5"
              strokeWidth="0.3"
            />
          ))}
        <path d={garmentPath} fill="url(#motif-pattern)" clipPath="url(#garment-clip)" />
        <path d={garmentPath} fill="none" stroke="#0f172a" strokeWidth="0.65" />
        <path
          d={`M ${neckX - neckRadiusX} ${neckY} C ${neckX - neckRadiusX * 0.65} ${neckY + neckRadiusY}, ${neckX + neckRadiusX * 0.65} ${neckY + neckRadiusY}, ${neckX + neckRadiusX} ${neckY}`}
          fill="none"
          stroke="#0f766e"
          strokeDasharray="1.2 1.2"
          strokeWidth="0.8"
        />

        {Array.from({ length: brushCount }).map((_, index) => {
          const x =
            garmentX +
            7 +
            (index * (spec.garmentWidth - 14)) / Math.max(brushCount - 1, 1);
          const y = garmentY + spec.garmentHeight - 3;
          return (
            <g key={x} transform={`translate(${x} ${y}) rotate(${index % 2 ? 14 : -14})`}>
              <path
                d="M -1.8 0 C -0.6 -2.5, 0.9 -2.5, 1.9 0 C 0.7 2, -0.8 2, -1.8 0"
                fill="#7c3aed"
                opacity="0.92"
              />
              <circle cx="0" cy="0" r="0.6" fill="#f8fafc" />
            </g>
          );
        })}

        <text x="4" y="7" className="svg-label">
          width: {spec.artboardWidth} cm
        </text>
        <text x={garmentX} y={garmentY + spec.garmentHeight + 7} className="svg-label">
          garment {spec.garmentWidth} × {spec.garmentHeight} cm
        </text>
      </svg>
    </article>
  );
}

function OutputChecklist({ spec }: { spec: GarmentSpec }) {
  const printableArea = Math.round(spec.garmentWidth * spec.garmentHeight);
  const utilization = Math.round((spec.garmentWidth / spec.artboardWidth) * 100);

  return (
    <article className="output-card">
      <p className="eyebrow">Production Notes</p>
      <h2>نیازهای مرحله بعد</h2>
      <ul className="check-list">
        <li>ایمپورت SVG واقعی و تبدیل هر فایل به node منبع.</li>
        <li>اتصال اندازه‌های لباس به دیتاست سایزبندی و گریدینگ.</li>
        <li>Export دقیق SVG/PDF با واحد cm/mm و metadata دستگاه چاپ.</li>
        <li>افزودن nodeهای boolean، offset path، tiling و random scatter.</li>
      </ul>
      <div className="metrics">
        <div>
          <span>مساحت چاپ تقریبی</span>
          <strong>{printableArea.toLocaleString("fa-IR")} cm²</strong>
        </div>
        <div>
          <span>استفاده از عرض دستگاه</span>
          <strong>{utilization.toLocaleString("fa-IR")}%</strong>
        </div>
      </div>
    </article>
  );
}

export default App;
