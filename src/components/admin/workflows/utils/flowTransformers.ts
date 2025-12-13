import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflows';

/**
 * Convert database workflow nodes to ReactFlow nodes
 */
export function dbNodesToFlowNodes(dbNodes: WorkflowNode[]): Node[] {
  return dbNodes.map((n) => ({
    id: n.id,
    type: n.node_type,
    position: { x: n.position_x, y: n.position_y },
    data: {
      ...n.node_config,
      action_type: n.action_type,
      trigger_event: n.node_config?.trigger_event,
      node_config: n.node_config,
    },
  }));
}

/**
 * Convert database workflow edges to ReactFlow edges
 */
export function dbEdgesToFlowEdges(dbEdges: WorkflowEdge[]): Edge[] {
  return dbEdges.map((e) => ({
    id: e.id,
    source: e.source_node_id,
    target: e.target_node_id,
    sourceHandle: e.edge_label === 'default' ? undefined : e.edge_label,
    label: e.edge_label === 'true' ? 'Ja' : e.edge_label === 'false' ? 'Nein' : undefined,
    style: {
      stroke: e.edge_label === 'true' ? 'hsl(142 76% 36%)' : e.edge_label === 'false' ? 'hsl(0 84% 60%)' : undefined,
    },
  }));
}

/**
 * Get edge styling based on edge label
 */
export function getEdgeStyle(edgeLabel: string | undefined) {
  return {
    stroke: edgeLabel === 'true' ? 'hsl(142 76% 36%)' : edgeLabel === 'false' ? 'hsl(0 84% 60%)' : undefined,
  };
}

/**
 * Get edge label text based on edge label value
 */
export function getEdgeLabelText(edgeLabel: string | undefined) {
  return edgeLabel === 'true' ? 'Ja' : edgeLabel === 'false' ? 'Nein' : undefined;
}
