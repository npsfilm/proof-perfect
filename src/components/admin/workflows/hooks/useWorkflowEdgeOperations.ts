import { useCallback } from 'react';
import type { Edge, Connection, EdgeChange } from '@xyflow/react';
import { addEdge } from '@xyflow/react';
import { useCreateEdge, useDeleteEdge } from '@/hooks/useWorkflowNodes';
import { getEdgeStyle, getEdgeLabelText } from '../utils/flowTransformers';

interface UseWorkflowEdgeOperationsProps {
  workflowId: string;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

export function useWorkflowEdgeOperations({
  workflowId,
  setEdges,
  onEdgesChange,
}: UseWorkflowEdgeOperationsProps) {
  const createEdge = useCreateEdge();
  const deleteEdgeMutation = useDeleteEdge();

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      const edgeLabel = params.sourceHandle === 'true' ? 'true' : params.sourceHandle === 'false' ? 'false' : 'default';

      const tempEdge: Edge = {
        id: `temp-edge-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        label: getEdgeLabelText(edgeLabel),
        style: getEdgeStyle(edgeLabel),
      };
      setEdges((eds) => addEdge(tempEdge, eds));

      if (!params.source.startsWith('temp-') && !params.target.startsWith('temp-')) {
        try {
          const dbEdge = await createEdge.mutateAsync({
            workflow_id: workflowId,
            source_node_id: params.source,
            target_node_id: params.target,
            edge_label: edgeLabel as 'default' | 'true' | 'false',
          });
          setEdges((eds) => eds.map((e) => (e.id === tempEdge.id ? { ...e, id: dbEdge.id } : e)));
        } catch (error) {
          console.error('Failed to create edge:', error);
          setEdges((eds) => eds.filter((e) => e.id !== tempEdge.id));
        }
      }
    },
    [workflowId, createEdge, setEdges]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);

      changes.forEach(async (change) => {
        if (change.type === 'remove' && !change.id.startsWith('temp-')) {
          await deleteEdgeMutation.mutateAsync({ id: change.id, workflow_id: workflowId });
        }
      });
    },
    [onEdgesChange, workflowId, deleteEdgeMutation]
  );

  return {
    onConnect,
    handleEdgesChange,
  };
}
