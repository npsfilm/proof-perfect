-- Workflow-Definitionen
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow-Aktionen (mehrere pro Workflow möglich)
CREATE TABLE public.workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow-Ausführungslog
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  trigger_event TEXT NOT NULL,
  trigger_payload JSONB,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RLS für workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all workflows"
ON public.workflows FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS für workflow_actions
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all workflow actions"
ON public.workflow_actions FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS für workflow_runs
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all workflow runs"
ON public.workflow_runs FOR SELECT
USING (has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Service role can manage workflow runs"
ON public.workflow_runs FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger für updated_at
CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();