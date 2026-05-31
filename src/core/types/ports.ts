/** انواع دادهٔ سوکت — الهام از رنگ‌بندی Blender */
export type PortDataType =
  | 'float'
  | 'vec2'
  | 'color'
  | 'bool'
  | 'path'
  | 'shape'
  | 'style'
  | 'image'
  | 'any';

export interface PortDefinition {
  id: string;
  label: string;
  dataType: PortDataType;
  /** ورودی اختیاری؛ اگر default داشته باشد بدون لینک هم cook می‌شود */
  optional?: boolean;
  defaultValue?: unknown;
}

export interface PortRef {
  nodeId: string;
  portId: string;
}

/** آیا اتصال از source به target مجاز است */
export function canConnect(source: PortDataType, target: PortDataType): boolean {
  if (target === 'any' || source === 'any') return true;
  if (source === target) return true;
  // castهای رایج در گراف وکتوری
  const casts: Record<string, PortDataType[]> = {
    vec2: ['path'],
    path: ['shape'],
    shape: ['style'],
  };
  return casts[source]?.includes(target) ?? false;
}
