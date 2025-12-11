import { useCallback, useRef, useState, DragEvent, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, ActionNode, DelayNode, ConditionNode, EndNode } from './nodes';
import { WorkflowToolbar } from './WorkflowToolbar';
import { NodeConfigPanel } from './NodeConfigPanel';
import { WorkflowTestPanel } from './WorkflowTestPanel';
import { Button } from '@/components/ui/button';
import { Save, Play, ArrowLeft, FlaskConical, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowWithNodes, useCreateNode, useUpdateNode, useDeleteNode, useCreateEdge, useDeleteEdge } from '@/hooks/useWorkflowNodes';
import { useWorkflow, useUpdateWorkflow } from '@/hooks/useWorkflows';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { NodeType, TriggerEvent, WorkflowNode, WorkflowEdge } from '@/types/workflows';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
  end: EndNode,
};

// Convert DB nodes to ReactFlow nodes
function dbNodesToFlowNodes(dbNodes: WorkflowNode[]): Node[] {
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

// Convert DB edges to ReactFlow edges
function dbEdgesToFlowEdges(dbEdges: WorkflowEdge[]): Edge[] {
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

interface WorkflowCanvasProps {
  workflowId: string;
}

export function WorkflowCanvas({ workflowId }: WorkflowCanvasProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const { data: workflowData, isLoading } = useWorkflowWithNodes(workflowId);
  const { data: workflow } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const createNode = useCreateNode();
  const updateNode = useUpdateNode();
  const deleteNodeMutation = useDeleteNode();
  const createEdge = useCreateEdge();
  const deleteEdgeMutation = useDeleteEdge();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load initial data
  useEffect(() => {
    if (workflowData) {
      const flowNodes = dbNodesToFlowNodes(workflowData.nodes);
      const flowEdges = dbEdgesToFlowEdges(workflowData.edges);

      // If no trigger node exists, create one
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
  }, [workflowData, setNodes, setEdges]);

  // Set workflow name
  useEffect(() => {
    if (workflow?.name) {
      setWorkflowName(workflow.name);
    }
  }, [workflow?.name]);

  // Get trigger event from trigger node
  const triggerNode = nodes.find((n) => n.type === 'trigger');
  const triggerEvent = triggerNode?.data?.trigger_event as TriggerEvent | undefined;

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      // Determine edge label based on source handle
      const edgeLabel = params.sourceHandle === 'true' ? 'true' : params.sourceHandle === 'false' ? 'false' : 'default';

      // If source node is temp, add edge locally
      if (params.source.startsWith('temp-')) {
        const newEdge: Edge = {
          id: `temp-edge-${Date.now()}`,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle,
          label: edgeLabel === 'true' ? 'Ja' : edgeLabel === 'false' ? 'Nein' : undefined,
          style: {
            stroke: edgeLabel === 'true' ? 'hsl(142 76% 36%)' : edgeLabel === 'false' ? 'hsl(0 84% 60%)' : undefined,
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        return;
      }

      // Create edge in database
      try {
        await createEdge.mutateAsync({
          workflow_id: workflowId,
          source_node_id: params.source,
          target_node_id: params.target,
          edge_label: edgeLabel as 'default' | 'true' | 'false',
        });
      } catch (error) {
        console.error('Failed to create edge:', error);
      }
    },
    [workflowId, createEdge, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create node in database
      try {
        const newNode = await createNode.mutateAsync({
          workflow_id: workflowId,
          node_type: type,
          action_type: type === 'action' ? 'send_email' : null,
          node_config: {},
          position_x: Math.round(position.x),
          position_y: Math.round(position.y),
        });

        // Add to local state
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

      // Handle position changes
      changes.forEach(async (change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && !node.id.startsWith('temp-')) {
            await updateNode.mutateAsync({
              id: change.id,
              workflow_id: workflowId,
              position_x: Math.round(change.position.x),
              position_y: Math.round(change.position.y),
            });
          }
        }
      });
    },
    [onNodesChange, nodes, workflowId, updateNode]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);

      // Handle edge removals
      changes.forEach(async (change) => {
        if (change.type === 'remove' && !change.id.startsWith('temp-')) {
          await deleteEdgeMutation.mutateAsync({ id: change.id, workflow_id: workflowId });
        }
      });
    },
    [onEdgesChange, workflowId, deleteEdgeMutation]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback(
    async (nodeId: string, data: Record<string, unknown>) => {
      // Update local state immediately
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
      );
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev));

      // Update in database if not temp
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
    [workflowId, deleteNodeMutation, setNodes, setEdges]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get trigger event from trigger node (could be in data or node_config)
      const triggerNode = nodes.find((n) => n.type === 'trigger');
      const currentTriggerEvent = triggerNode?.data?.trigger_event || 
                                   triggerNode?.data?.node_config?.trigger_event || 
                                   triggerEvent;

      // Always update workflow to sync trigger_event
      await updateWorkflow.mutateAsync({
        id: workflowId,
        name: workflowName,
        trigger_event: currentTriggerEvent,
      });

      // Save trigger node if it's temp
      const tempTrigger = nodes.find((n) => n.id === 'temp-trigger');
      if (tempTrigger) {
        const triggerEventValue = tempTrigger.data.trigger_event || tempTrigger.data.node_config?.trigger_event;
        await createNode.mutateAsync({
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
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Lade Workflow...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/workflows')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 w-[300px]"
            placeholder="Workflow-Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showTestPanel ? "default" : "outline"} 
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            {showTestPanel ? (
              <X className="h-4 w-4 mr-2" />
            ) : (
              <FlaskConical className="h-4 w-4 mr-2" />
            )}
            {showTestPanel ? 'Schließen' : 'Testen'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-[220px] border-r p-2 bg-muted/30">
          <WorkflowToolbar />
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
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
        </div>

        {/* Config Panel */}
        {selectedNode && !showTestPanel && (
          <div className="w-[300px] border-l">
            <NodeConfigPanel
              node={selectedNode}
              triggerEvent={triggerEvent}
              onUpdate={handleNodeUpdate}
              onDelete={handleNodeDelete}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}

        {/* Test Panel */}
        {showTestPanel && (
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
