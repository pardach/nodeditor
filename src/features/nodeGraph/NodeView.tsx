import { getNodeDefinition } from "../../core/nodes/registry";
import type { EvaluationDiagnostic, GraphNode } from "../../core/types/graph";
import { useDocumentStore } from "../../store/documentStore";

interface NodeViewProps {
  node: GraphNode;
  selected: boolean;
  diagnostics: EvaluationDiagnostic[];
}

export const NodeView = ({ node, selected, diagnostics }: NodeViewProps) => {
  const { dispatchCommand } = useDocumentStore();
  const definition = getNodeDefinition(node.type);
  const hasError = diagnostics.some((diagnostic) => diagnostic.severity === "error");

  return (
    <article
      className={`node-card ${selected ? "node-card--selected" : ""} ${hasError ? "node-card--error" : ""}`}
      style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
      onClick={() => dispatchCommand({ kind: "select-node", nodeId: node.id })}
    >
      <header className="node-card__header">
        <span>{node.label ?? definition?.label ?? node.type}</span>
        <small>{definition?.category ?? "unknown"}</small>
      </header>
      <div className="node-card__body">
        <SocketColumn sockets={definition?.inputs ?? []} direction="input" />
        <div className="node-card__meta">
          <span>{definition?.description ?? "Missing definition"}</span>
          {diagnostics.length > 0 ? <strong>{diagnostics[0].message}</strong> : null}
        </div>
        <SocketColumn sockets={definition?.outputs ?? []} direction="output" />
      </div>
    </article>
  );
};

const SocketColumn = ({
  sockets,
  direction,
}: {
  sockets: { id: string; label: string; dataType: string }[];
  direction: "input" | "output";
}) => (
  <div className={`socket-column socket-column--${direction}`}>
    {sockets.map((socket) => (
      <span className={`socket socket--${socket.dataType}`} key={socket.id} title={`${socket.label}: ${socket.dataType}`}>
        <i />
        {direction === "input" ? socket.label : null}
        {direction === "output" ? socket.label : null}
      </span>
    ))}
  </div>
);
