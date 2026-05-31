import type { GraphEdge, GraphNode } from "../../core/types/graph";

interface EdgeViewProps {
  edge: GraphEdge;
  nodes: Record<string, GraphNode>;
}

export const EdgeView = ({ edge, nodes }: EdgeViewProps) => {
  const source = nodes[edge.sourceNodeId];
  const target = nodes[edge.targetNodeId];

  if (!source || !target) {
    return null;
  }

  const start = { x: source.position.x + 224, y: source.position.y + 78 };
  const end = { x: target.position.x, y: target.position.y + 78 };
  const distance = Math.max(80, Math.abs(end.x - start.x) * 0.45);
  const d = `M ${start.x} ${start.y} C ${start.x + distance} ${start.y}, ${end.x - distance} ${end.y}, ${end.x} ${end.y}`;

  return <path className="edge-path" d={d} />;
};
