import { ReactFlow, Controls, Background, BackgroundVariant, Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DragEvent } from 'react';

interface WorkflowPaneProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onInit: (instance: any) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  nodeTypes: Record<string, any>;
}

export function WorkflowPane({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onDrop,
  onDragOver,
  onNodeClick,
  onPaneClick,
  nodeTypes,
}: WorkflowPaneProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      snapToGrid
      snapGrid={[15, 15]}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: { strokeWidth: 2 },
      }}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
    </ReactFlow>
  );
}
