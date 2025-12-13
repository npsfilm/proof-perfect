import { useCallback, DragEvent } from 'react';
import type { Node, NodeChange } from '@xyflow/react';
import type { NodeType } from '@/types/workflows';
import { useCreateNode, useUpdateNode, useDeleteNode } from '@/hooks/useWorkflowNodes';

interface UseWorkflowNodeOperationsProps {
  workflowId: string;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedNode: (node: Node | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  reactFlowInstance: any;
}

export function useWorkflowNodeOperations({
  workflowId,
  nodes,
  setNodes,
  setEdges,
  setSelectedNode,
  onNodesChange,
  reactFlowInstance,
}: UseWorkflowNodeOperationsProps) {
  const createNode = useCreateNode();
  const updateNode = useUpdateNode();
  const deleteNodeMutation = useDeleteNode();

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        const newNode = await createNode.mutateAsync({
          workflow_id: workflowId,
          node_type: type,
          action_type: type === 'action' ? 'send_email' : null,
          node_config: {},
          position_x: Math.round(position.x),
          position_y: Math.round(position.y),
        });

        const flowNode: Node = {
          id: newNode.id,
          type: newNode.node_type,
          position: { x: newNode.position_x, y: newNode.position_y },
          data: {
            ...newNode.node_config,
            action_type: newNode.action_type,
            node_config: newNode.node_config,
          },
        };
        setNodes((nds) => [...nds, flowNode]);
      } catch (error) {
        console.error('Failed to create node:', error);
      }
    },
    [reactFlowInstance, workflowId, createNode, setNodes]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      changes.forEach(async (change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && !node.id.startsWith('temp-')) {
            await updateNode.mutateAsync({
              id: change.id,
              workflow_id: workflowId,
              position_x: Math.round(change.position.x),
              position_y: Math.round(change.position.y),
              skipInvalidation: true,
            });
          }
        }
      });
    },
    [onNodesChange, nodes, workflowId, updateNode]
  );

  const handleNodeUpdate = useCallback(
    async (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
      );

      if (!nodeId.startsWith('temp-')) {
        await updateNode.mutateAsync({
          id: nodeId,
          workflow_id: workflowId,
          action_type: data.action_type as any,
          node_config: data.node_config as any,
        });
      }
    },
    [workflowId, updateNode, setNodes]
  );

  const handleNodeDelete = useCallback(
    async (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode(null);

      if (!nodeId.startsWith('temp-')) {
        await deleteNodeMutation.mutateAsync({ id: nodeId, workflow_id: workflowId });
      }
    },
    [workflowId, deleteNodeMutation, setNodes, setEdges, setSelectedNode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return {
    onDragOver,
    onDrop,
    handleNodesChange,
    handleNodeUpdate,
    handleNodeDelete,
    onNodeClick,
    onPaneClick,
    createNode,
  };
}
