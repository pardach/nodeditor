import type { GraphEvaluationResult } from "../../core/types/graph";
import { useDocumentStore } from "../../store/documentStore";
import { EdgeView } from "./EdgeView";
import { NodeView } from "./NodeView";

interface NodeGraphCanvasProps {
  evaluation: GraphEvaluationResult;
}

export const NodeGraphCanvas = ({ evaluation }: NodeGraphCanvasProps) => {
  const { document } = useDocumentStore();
  const nodes = Object.values(document.nodes);
  const edges = Object.values(document.edges);

  return (
    <div className="node-graph-canvas" role="application" aria-label="Procedural node graph">
      <div className="graph-grid" />
      <svg className="edge-layer" viewBox="0 0 1280 640" preserveAspectRatio="none">
        {edges.map((edge) => (
          <EdgeView key={edge.id} edge={edge} nodes={document.nodes} />
        ))}
      </svg>
      <div className="node-layer">
        {nodes.map((node) => (
          <NodeView
            key={node.id}
            node={node}
            selected={document.view.selectedNodeIds.includes(node.id)}
            diagnostics={evaluation.nodeResults[node.id]?.diagnostics ?? []}
          />
        ))}
      </div>
    </div>
  );
};
