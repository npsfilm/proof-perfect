-- Availability settings table for weekly working hours
CREATE TABLE public.availability_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Weekly working hours
  monday_enabled BOOLEAN NOT NULL DEFAULT true,
  monday_start TIME NOT NULL DEFAULT '08:00',
  monday_end TIME NOT NULL DEFAULT '18:00',
  
  tuesday_enabled BOOLEAN NOT NULL DEFAULT true,
  tuesday_start TIME NOT NULL DEFAULT '08:00',
  tuesday_end TIME NOT NULL DEFAULT '18:00',
  
  wednesday_enabled BOOLEAN NOT NULL DEFAULT true,
  wednesday_start TIME NOT NULL DEFAULT '08:00',
  wednesday_end TIME NOT NULL DEFAULT '18:00',
  
  thursday_enabled BOOLEAN NOT NULL DEFAULT true,
  thursday_start TIME NOT NULL DEFAULT '08:00',
  thursday_end TIME NOT NULL DEFAULT '18:00',
  
  friday_enabled BOOLEAN NOT NULL DEFAULT true,
  friday_start TIME NOT NULL DEFAULT '08:00',
  friday_end TIME NOT NULL DEFAULT '18:00',
  
  saturday_enabled BOOLEAN NOT NULL DEFAULT false,
  saturday_start TIME NOT NULL DEFAULT '09:00',
  saturday_end TIME NOT NULL DEFAULT '14:00',
  
  sunday_enabled BOOLEAN NOT NULL DEFAULT false,
  sunday_start TIME NOT NULL DEFAULT '09:00',
  sunday_end TIME NOT NULL DEFAULT '14:00',
  
  -- Slot interval in minutes
  slot_interval INTEGER NOT NULL DEFAULT 30,
  
  -- Buffer time between appointments (minutes)
  buffer_before INTEGER NOT NULL DEFAULT 0,
  buffer_after INTEGER NOT NULL DEFAULT 15,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocked dates / vacation table
CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_settings
CREATE POLICY "Admins can manage own availability settings"
ON public.availability_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id)
WITH CHECK (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id);

-- RLS Policies for blocked_dates
CREATE POLICY "Admins can manage own blocked dates"
ON public.blocked_dates
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id)
WITH CHECK (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_availability_settings_updated_at
BEFORE UPDATE ON public.availability_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();