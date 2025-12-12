-- Email Sequences Table
CREATE TABLE public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('client_created', 'booking_completed', 'gallery_delivered', 'inactivity_30d', 'inactivity_90d', 'manual')),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  delay_after_trigger_minutes INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Sequence Steps Table
CREATE TABLE public.email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE RESTRICT,
  step_order INT NOT NULL,
  delay_from_previous_minutes INT DEFAULT 0,
  subject_override TEXT,
  skip_conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Sequence Enrollments Table
CREATE TABLE public.email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  current_step INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  next_send_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(client_id, sequence_id)
);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_sequences
CREATE POLICY "Admins can manage email sequences"
ON public.email_sequences FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for email_sequence_steps
CREATE POLICY "Admins can manage email sequence steps"
ON public.email_sequence_steps FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for email_sequence_enrollments
CREATE POLICY "Admins can manage email sequence enrollments"
ON public.email_sequence_enrollments FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Indexes for performance
CREATE INDEX idx_sequence_steps_sequence_id ON public.email_sequence_steps(sequence_id);
CREATE INDEX idx_sequence_enrollments_sequence_id ON public.email_sequence_enrollments(sequence_id);
CREATE INDEX idx_sequence_enrollments_client_id ON public.email_sequence_enrollments(client_id);
CREATE INDEX idx_sequence_enrollments_next_send ON public.email_sequence_enrollments(next_send_at) WHERE status = 'active';

-- Trigger for updated_at
CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();