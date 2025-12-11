-- Workflow-Nodes ersetzen workflow_actions für komplexe Flows
CREATE TABLE public.workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  node_type TEXT NOT NULL, -- 'trigger', 'action', 'delay', 'condition', 'end'
  action_type TEXT, -- Nur für action-nodes: 'send_email', 'send_webhook', etc.
  node_config JSONB DEFAULT '{}',
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Verbindungen zwischen Nodes
CREATE TABLE public.workflow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  source_node_id UUID REFERENCES public.workflow_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES public.workflow_nodes(id) ON DELETE CASCADE NOT NULL,
  edge_label TEXT DEFAULT 'default', -- 'default', 'true', 'false' für Bedingungen
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Geplante Workflow-Ausführungen (für Delays)
CREATE TABLE public.scheduled_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES public.workflow_nodes(id) ON DELETE CASCADE NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Workflow-Run erweitern für Step-Tracking
ALTER TABLE public.workflow_runs 
ADD COLUMN IF NOT EXISTS current_node_id UUID REFERENCES public.workflow_nodes(id),
ADD COLUMN IF NOT EXISTS execution_path JSONB DEFAULT '[]';

-- RLS für workflow_nodes
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow nodes"
ON public.workflow_nodes
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS für workflow_edges
ALTER TABLE public.workflow_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow edges"
ON public.workflow_edges
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS für scheduled_workflow_steps
ALTER TABLE public.scheduled_workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled steps"
ON public.scheduled_workflow_steps
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Index für schnelle Abfragen
CREATE INDEX idx_workflow_nodes_workflow_id ON public.workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_edges_workflow_id ON public.workflow_edges(workflow_id);
CREATE INDEX idx_workflow_edges_source ON public.workflow_edges(source_node_id);
CREATE INDEX idx_scheduled_steps_status ON public.scheduled_workflow_steps(status, scheduled_for);