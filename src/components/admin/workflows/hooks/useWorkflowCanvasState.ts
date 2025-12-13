import { useState, useRef } from 'react';
import type { Node } from '@xyflow/react';

export interface WorkflowCanvasStateResult {
  reactFlowInstance: any;
  setReactFlowInstance: (instance: any) => void;
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  showTestPanel: boolean;
  setShowTestPanel: (show: boolean) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  initialLoadedRef: React.MutableRefObject<boolean>;
}

/**
 * Consolidates all useState hooks for WorkflowCanvas component
 */
export function useWorkflowCanvasState(): WorkflowCanvasStateResult {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const initialLoadedRef = useRef(false);
  
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  return {
    reactFlowInstance,
    setReactFlowInstance,
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isSaving,
    setIsSaving,
    showTestPanel,
    setShowTestPanel,
    reactFlowWrapper,
    initialLoadedRef,
  };
}
