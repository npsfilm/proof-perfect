import { useEffect } from 'react';
import { useNodesState, useEdgesState, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, ActionNode, DelayNode, ConditionNode, EndNode } from './nodes';
import { WorkflowToolbar } from './WorkflowToolbar';
import { NodeConfigPanel } from './NodeConfigPanel';
import { WorkflowTestPanel } from './WorkflowTestPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowPane } from './WorkflowPane';
import { useWorkflowWithNodes } from '@/hooks/useWorkflowNodes';
import { useWorkflow, useUpdateWorkflow } from '@/hooks/useWorkflows';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowCanvasState } from './hooks/useWorkflowCanvasState';
import { useWorkflowNodeOperations } from './hooks/useWorkflowNodeOperations';
import { useWorkflowEdgeOperations } from './hooks/useWorkflowEdgeOperations';
import { dbNodesToFlowNodes, dbEdgesToFlowEdges } from './utils/flowTransformers';
import type { TriggerEvent } from '@/types/workflows';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
  end: EndNode,
};

interface WorkflowCanvasProps {
  workflowId: string;
}

export function WorkflowCanvas({ workflowId }: WorkflowCanvasProps) {
  const { toast } = useToast();
  const state = useWorkflowCanvasState();

  const { data: workflowData, isLoading } = useWorkflowWithNodes(workflowId);
  const { data: workflow } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeOps = useWorkflowNodeOperations({
    workflowId,
    nodes,
    setNodes,
    setEdges,
    setSelectedNode: state.setSelectedNode,
    onNodesChange,
    reactFlowInstance: state.reactFlowInstance,
  });

  const edgeOps = useWorkflowEdgeOperations({
    workflowId,
    setEdges,
    onEdgesChange,
  });

  // Load initial data
  useEffect(() => {
    if (workflowData && !state.initialLoadedRef.current) {
      state.initialLoadedRef.current = true;
      const flowNodes = dbNodesToFlowNodes(workflowData.nodes);
      const flowEdges = dbEdgesToFlowEdges(workflowData.edges);

      if (!flowNodes.find((n) => n.type === 'trigger')) {
        const triggerNode: Node = {
          id: 'temp-trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: { trigger_event: workflowData.workflow.trigger_event },
        };
        setNodes([triggerNode, ...flowNodes]);
      } else {
        setNodes(flowNodes);
      }
      setEdges(flowEdges);
    }
  }, [workflowData, setNodes, setEdges, state.initialLoadedRef]);

  useEffect(() => {
    if (workflow?.name) {
      state.setWorkflowName(workflow.name);
    }
  }, [workflow?.name, state.setWorkflowName]);

  const triggerNode = nodes.find((n) => n.type === 'trigger');
  const triggerEvent = triggerNode?.data?.trigger_event as TriggerEvent | undefined;

  const handleSave = async () => {
    state.setIsSaving(true);
    try {
      const currentTriggerEvent = triggerNode?.data?.trigger_event || 
                                   triggerNode?.data?.node_config?.trigger_event || 
                                   triggerEvent;

      await updateWorkflow.mutateAsync({
        id: workflowId,
        name: state.workflowName,
        trigger_event: currentTriggerEvent,
      });

      const tempTrigger = nodes.find((n) => n.id === 'temp-trigger');
      if (tempTrigger) {
        const triggerEventValue = tempTrigger.data.trigger_event || tempTrigger.data.node_config?.trigger_event;
        await nodeOps.createNode.mutateAsync({
          workflow_id: workflowId,
          node_type: 'trigger',
          node_config: { trigger_event: triggerEventValue },
          position_x: Math.round(tempTrigger.position.x),
          position_y: Math.round(tempTrigger.position.y),
        });
      }

      toast({ title: 'Workflow gespeichert' });
    } catch (error: any) {
      toast({ title: 'Fehler beim Speichern', description: error.message, variant: 'destructive' });
    } finally {
      state.setIsSaving(false);
    }
  };

  // Update selectedNode when nodes change
  useEffect(() => {
    if (state.selectedNode) {
      const updatedNode = nodes.find(n => n.id === state.selectedNode?.id);
      if (updatedNode && JSON.stringify(updatedNode.data) !== JSON.stringify(state.selectedNode.data)) {
        state.setSelectedNode(updatedNode);
      }
    }
  }, [nodes, state.selectedNode, state.setSelectedNode]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Lade Workflow...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <WorkflowHeader
        workflowName={state.workflowName}
        onNameChange={state.setWorkflowName}
        showTestPanel={state.showTestPanel}
        onToggleTestPanel={() => state.setShowTestPanel(!state.showTestPanel)}
        isSaving={state.isSaving}
        onSave={handleSave}
      />

      <div className="flex-1 flex">
        <div className="w-[220px] border-r p-2 bg-muted/30">
          <WorkflowToolbar />
        </div>

        <div className="flex-1" ref={state.reactFlowWrapper}>
          <WorkflowPane
            nodes={nodes}
            edges={edges}
            onNodesChange={nodeOps.handleNodesChange}
            onEdgesChange={edgeOps.handleEdgesChange}
            onConnect={edgeOps.onConnect}
            onInit={state.setReactFlowInstance}
            onDrop={nodeOps.onDrop}
            onDragOver={nodeOps.onDragOver}
            onNodeClick={nodeOps.onNodeClick}
            onPaneClick={nodeOps.onPaneClick}
            nodeTypes={nodeTypes}
          />
        </div>

        {state.selectedNode && !state.showTestPanel && (
          <div className="w-[300px] border-l">
            <NodeConfigPanel
              node={state.selectedNode}
              triggerEvent={triggerEvent}
              onUpdate={nodeOps.handleNodeUpdate}
              onDelete={nodeOps.handleNodeDelete}
              onClose={() => state.setSelectedNode(null)}
            />
          </div>
        )}

        {state.showTestPanel && (
          <div className="w-[350px] border-l">
            <WorkflowTestPanel
              workflowId={workflowId}
              triggerEvent={triggerEvent}
              triggerNodeId={triggerNode?.id}
              onExecutionStart={() => {}}
              onExecutionComplete={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
