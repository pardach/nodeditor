import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getNodeDefinition } from "../../core/nodes/registry";
import type { EvaluationDiagnostic, GraphNode } from "../../core/types/graph";

export type FlowNodeCardData = Record<string, unknown> & {
  graphNode: GraphNode;
  diagnostics: EvaluationDiagnostic[];
};

export type FlowGraphNode = Node<FlowNodeCardData, "graph-node">;

export const FlowNodeCard = ({ data, selected }: NodeProps<FlowGraphNode>) => {
  const definition = getNodeDefinition(data.graphNode.type);
  const hasError = data.diagnostics.some((diagnostic) => diagnostic.severity === "error");
  const inputs = definition?.inputs ?? [];
  const outputs = definition?.outputs ?? [];
  const contentRows = Math.max(1, inputs.length, outputs.length);

  return (
    <article className={`flow-node ${selected ? "flow-node--selected" : ""} ${hasError ? "flow-node--error" : ""}`}>
      <header className="flow-node__header">
        <span>{data.graphNode.label ?? definition?.label ?? data.graphNode.type}</span>
        <small>{definition?.category ?? "unknown"}</small>
      </header>
      <div className="flow-node__body">
        <div className="flow-node__column flow-node__column--inputs">
          {inputs.map((socket, index) => (
            <div className="flow-node__socket-row flow-node__socket-row--input" key={`input:${socket.id}`}>
              <Handle
                type="target"
                id={socket.id}
                position={Position.Left}
                className={`flow-node__handle flow-node__handle--${socket.dataType}`}
                style={{ top: socketTop(index, contentRows) }}
              />
              <span title={`${socket.label}: ${socket.dataType}`}>{socket.label}</span>
            </div>
          ))}
        </div>
        <div className="flow-node__meta">
          <span>{definition?.description ?? "Missing definition."}</span>
          {data.diagnostics.length > 0 ? <strong>{data.diagnostics[0].message}</strong> : null}
        </div>
        <div className="flow-node__column flow-node__column--outputs">
          {outputs.map((socket, index) => (
            <div className="flow-node__socket-row flow-node__socket-row--output" key={`output:${socket.id}`}>
              <span title={`${socket.label}: ${socket.dataType}`}>{socket.label}</span>
              <Handle
                type="source"
                id={socket.id}
                position={Position.Right}
                className={`flow-node__handle flow-node__handle--${socket.dataType}`}
                style={{ top: socketTop(index, contentRows) }}
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

const socketTop = (index: number, rows: number): string => {
  if (rows <= 1) {
    return "50%";
  }

  return `${((index + 1) / (rows + 1)) * 100}%`;
};
