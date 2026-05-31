# معماری ویرایشگر نود وکتوری ۲بعدی

این سند معماری پیشنهادی برای یک ویرایشگر نود **وکتوری ۲بعدی** روی React است؛ الهام‌گرفته از Blender (Geometry/Shader Nodes)، Houdini (SOP/VOP) و Substance Painter (گراف فیلتر + پیش‌نمایش زنده).

---

## ۱. آنچه در نرم‌افزارهای حرفه‌ای مشترک است

| قابلیت | Blender | Houdini | Substance Painter | نقش در ویرایشگر ما |
|--------|---------|---------|-------------------|---------------------|
| گراف جهت‌دار (DAG) | ✓ | ✓ | ✓ | هسته ارزیابی |
| سوکت‌های تایپ‌شده + رنگ | ✓ | ✓ | ✓ | جلوگیری از اتصال نامعتبر |
| گروه/زیرگراف (Node Group / HDA) | ✓ | ✓ | محدود | قابلیت ترکیب مجدد |
| پیش‌نمایش تدریجی (incremental) | ✓ | ✓ | ✓ | UX اصلی |
| Mute / Bypass / Reroute | ✓ | ✓ | — | دیباگ و تمیزکاری گراف |
| Undo/Redo فرمان‌محور | ✓ | ✓ | ✓ | تاریخچه قابل اعتماد |
| کش نتیجهٔ نود | ✓ | ✓ | ✓ | عملکرد روی گراف بزرگ |
| Expression / Parm Link | محدود | ✓ قوی | — | پارامترهای وابسته |
| Context جدا (Shader vs Geo) | ✓ | ✓ (SOP/VOP/…) | لایه vs فیلتر | **فضای کاری** (Path / Style / Export) |
| Serialization + Versioning | ✓ | ✓ | ✓ | پروژه و همکاری |

---

## ۲. اصول طراحی

1. **جداسازی هسته از UI** — موتور گراف و ارزیابی بدون وابستگی به React؛ تست‌پذیر و قابل استفاده در worker.
2. **دادهٔ کاننیکال، نمایش مشتق** — گراف JSON-like؛ UI فقط view state (زوم، انتخاب، پنل).
3. **ارزیابی تنبل + dirty propagation** — فقط زیردرخت تغییرکرده دوباره cook شود (الگوی Houdini).
4. **تایپ در compile-time و runtime** — TypeScript برای توسعه‌دهنده؛ schema برای اتصال سوکت‌ها.
5. **غیرمخرب** — خروجی هر نود immutable؛ تاریخچه با Command Pattern.

---

## ۳. لایه‌های سیستم

```
┌─────────────────────────────────────────────────────────────┐
│  App Shell (React) — routing, workspace, shortcuts          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer — canvas, inspector, library, preview viewport    │
│    (react-flow / custom canvas + Zustand selectors)         │
├─────────────────────────────────────────────────────────────┤
│  Interaction — selection, wiring, drag-drop, context menu   │
├─────────────────────────────────────────────────────────────┤
│  Commands — undo/redo, clipboard, group/ungroup             │
├─────────────────────────────────────────────────────────────┤
│  Node Registry — تعریف نودها، پورت‌ها، UI widgets           │
├─────────────────────────────────────────────────────────────┤
│  Evaluation Engine — topological sort, cache, errors        │
├─────────────────────────────────────────────────────────────┤
│  Geometry Kernel — Path2D, boolean, offset, simplify (WASM?)│
├─────────────────────────────────────────────────────────────┤
│  Document Model — Graph, Node, Edge, Group, Metadata        │
└─────────────────────────────────────────────────────────────┘
```

---

## ۴. مدل سند (Document Model)

### موجودیت‌ها

- **GraphDocument** — ریشه؛ شامل `nodes`, `edges`, `groups`, `viewState`, `version`.
- **NodeInstance** — `id`, `typeId`, `params`, `position`, `flags` (muted, locked, preview).
- **Edge** — `from: {nodeId, portId}`, `to: {nodeId, portId}`؛ جهت از خروجی به ورودی.
- **Group** — زیرگراف با `interface` (ورودی/خروجی exposed)؛ معادل Node Group / HDA ساده.
- **PortDefinition** — در registry؛ نه در هر instance.

### انواع داده (Value Types)

| Type | کاربرد | رنگ سوکت (پیشنهادی) |
|------|--------|---------------------|
| `float` | ضخامت، شفافیت، زاویه | سبز |
| `vec2` | نقطه، کنترل بزیه | آبی روشن |
| `color` | RGBA | زرد |
| `bool` | شرط، visibility | بنفش |
| `path` | مسیر وکتوری (زیردرخت شکل) | نارنجی |
| `shape` | شکل بسته با fill/stroke rules | قرمز |
| `style` | brush، dash، gradient ref | صورتی |
| `image` | رستر برای پیش‌نمایش/اکسپورت | خاکستری |

اتصال فقط وقتی مجاز است که `source.type` به `target.type` cast شود (مثلاً `vec2` → `path` با نود Point).

---

## ۵. موتور ارزیابی (Evaluation)

```
تغییر پارامتر/توپولوژی
        ↓
  markDirty(nodeId)  — BFS/DFS به سمت downstream
        ↓
  topologicalSort(subgraph)  — تشخیص cycle → خطا
        ↓
  برای هر نود به ترتیب:
    - اگر muted → pass-through ورودی اصلی
    - خواندن ورودی‌ها از cache
    - evaluate(node) → Value
    - ذخیره در NodeCache
        ↓
  publish به PreviewStore (React subscribe)
```

- **Preview node**: هر نود می‌تواند `previewEnabled` داشته باشد؛ آخرین نود preview شده در viewport نشان داده می‌شود (مثل Substance).
- **Error handling**: خطا per-node؛ گراف بقیه را تا جایی که ممکن است cook کند (graceful degradation).

---

## ۶. رجیستری نود (Node Registry)

هر نود در registry:

```ts
interface NodeDefinition {
  typeId: string;
  category: 'primitive' | 'curve' | 'combine' | 'style' | 'utility';
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  defaultParams: Record<string, unknown>;
  evaluate(ctx: EvalContext): PortValues;
  // اختیاری برای UI
  icon?: string;
  paramSchema?: ParamField[];
}
```

نودهای پایهٔ وکتوری (فاز ۱):

- Primitives: Rectangle, Ellipse, Polygon, Star
- Curve: Bezier, Path from Points, Text to Path
- Combine: Union, Subtract, Intersect, Exclude (boolean)
- Transform: Translate, Rotate, Scale, Mirror
- Styling: Fill, Stroke, Gradient, Pattern
- Utility: Reroute, Switch, Merge, Group I/O

---

## ۷. UI روی React

### State

| Store | محتوا |
|-------|--------|
| `documentStore` | گراف کاننیکال (immer) |
| `evalStore` | نتایج cache + errors |
| `uiStore` | selection, hovered, pan/zoom, active tool |
| `historyStore` | undo stack (commands) |

### کامپوننت‌های اصلی

- `NodeCanvas` — گراف؛ پیشنهاد: **@xyflow/react** برای wiring + custom node renderer برای سوکت‌های تایپ‌شده.
- `Viewport2D` — SVG یا Canvas2D برای پیش‌نمایش path؛ sync با `evalStore.previewPath`.
- `Inspector` — پارامترهای نود انتخاب‌شده؛ binding دوطرفه → command → dirty.
- `NodeLibrary` — drag از پالت؛ ایجاد instance با موقعیت drop.
- `GraphBreadcrumb` — هنگام ورود به Group/HDA.

### تعامل (الگوی Blender)

- کشیدن از سوکت → highlight سازگار
- Ctrl+Drag → duplicate node با لینک
- M → mute؛ H → hide preview
- Frame/Comment box برای سازماندهی (مثل Blender Frame)

---

## ۸. فضاهای کاری (Workspaces) — الهام از Contextهای Houdini

| Workspace | هدف | خروجی نهایی |
|-----------|------|-------------|
| **Shape** | ساخت هندسه path | `shape` |
| **Style** | fill/stroke/effects روی shape | `styledShape` |
| **Export** | SVG, PDF, PNG raster | فایل |

هر workspace همان موتور را دارد؛ `NodeRegistry` فیلتر می‌شود تا نودهای نامربوط نشان داده نشوند.

---

## ۹. Serialization

```json
{
  "format": "vector-node-doc",
  "version": 1,
  "graph": { "nodes": [], "edges": [], "groups": [] },
  "meta": { "name": "", "created": "" }
}
```

- Migration pipeline: `v1 → v2` با تابع‌های pure
- اختیاری: CRDT/Yjs برای همکاری realtime (فاز بعد)

---

## ۱۰. ساختار پوشه‌ها (پیاده‌سازی)

```
src/
  core/
    document/     # types, graph helpers, validation
    eval/         # engine, cache, dirty graph
    commands/     # undoable mutations
    types/        # value types, port types
  nodes/
    registry.ts
    builtins/     # primitive, combine, style, ...
  geometry/       # path ops (future WASM)
  stores/         # zustand slices
  ui/             # React components (فاز بعد)
  app/            # entry, layout
```

---

## ۱۱. نقشه راه

| فاز | محتوا |
|-----|--------|
| **M0** | document model + registry + eval engine + unit tests |
| **M1** | canvas wiring + inspector + 5 نود primitive |
| **M2** | boolean ops + viewport SVG preview |
| **M3** | groups + export SVG |
| **M4** | expression params + performance (worker eval) |

---

## ۱۲. فناوری‌های پیشنهادی

- **React 18+** + **TypeScript**
- **Vite** — build
- **Zustand** + **immer** — state
- **@xyflow/react** — node canvas
- **paper.js** یا **@flatten-js/core** — boolean 2D (ارزیابی شود)
- **vitest** — تست هسته

---

## ۱۳. تفاوت آگاهانه با Blender/Houdini

- گراف ما **۲بعدی وکتوری** است نه مش یا volume؛ نیازی به SOP attribute روی point نیست، اما می‌توان `path.metadata` برای id/layer گذاشت.
- **Real-time** مهم‌تر از batch cook؛ debounce ارزیابی (~16ms) برای drag پارامتر.
- **Substance-like preview**: viewport همیشه آخرین preview path را نشان می‌دهد، نه فقط خروجی root.

---

این معماری در `src/core` و `src/nodes` به‌صورت اسکلت TypeScript شروع شده است.
