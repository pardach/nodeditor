import { useEffect, useMemo } from "react";
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type OnConnect,
  type OnMoveEnd,
} from "@xyflow/react";
import type { GraphEvaluationResult } from "../../core/types/graph";
import { useDocumentStore } from "../../store/documentStore";
import { FlowNodeCard, type FlowGraphNode } from "./FlowNodeCard";

interface NodeGraphCanvasProps {
  evaluation: GraphEvaluationResult;
}

const nodeTypes = {
  "graph-node": FlowNodeCard,
};

export const NodeGraphCanvas = ({ evaluation }: NodeGraphCanvasProps) => {
  const { document, dispatchCommand } = useDocumentStore();
  const flowNodes = useMemo<FlowGraphNode[]>(
    () =>
      Object.values(document.nodes).map((node) => ({
        id: node.id,
        type: "graph-node",
        position: node.position,
        data: {
          graphNode: node,
          diagnostics: evaluation.nodeResults[node.id]?.diagnostics ?? [],
        },
        selected: document.view.selectedNodeIds.includes(node.id),
      })),
    [document.nodes, document.view.selectedNodeIds, evaluation.nodeResults],
  );
  const flowEdges = useMemo<Edge[]>(
    () =>
      Object.values(document.edges).map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        sourceHandle: edge.sourceSocketId,
        target: edge.targetNodeId,
        targetHandle: edge.targetSocketId,
        type: "smoothstep",
        className: document.view.selectedEdgeIds.includes(edge.id) ? "flow-edge flow-edge--selected" : "flow-edge",
      })),
    [document.edges, document.view.selectedEdgeIds],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const onConnect: OnConnect = (connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      return;
    }

    dispatchCommand({
      kind: "connect-nodes",
      sourceNodeId: connection.source,
      sourceSocketId: connection.sourceHandle,
      targetNodeId: connection.target,
      targetSocketId: connection.targetHandle,
    });
  };

  const onMoveEnd: OnMoveEnd = (_event, viewport) => {
    dispatchCommand({
      kind: "set-view",
      zoom: viewport.zoom,
      pan: {
        x: viewport.x,
        y: viewport.y,
      },
    });
  };

  return (
    <div className="node-graph-canvas" role="application" aria-label="Procedural node graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={(_event, node) =>
          dispatchCommand({
            kind: "move-node",
            nodeId: node.id,
            position: node.position,
          })
        }
        onNodeClick={(_event, node) => dispatchCommand({ kind: "select-node", nodeId: node.id })}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultViewport={{ x: document.view.pan.x, y: document.view.pan.y, zoom: document.view.zoom }}
        snapToGrid
        snapGrid={[16, 16]}
        fitView={false}
      >
        <Background color="rgba(255,255,255,0.08)" gap={28} />
        <MiniMap pannable zoomable className="graph-minimap" />
        <Controls />
      </ReactFlow>
    </div>
  );
};
