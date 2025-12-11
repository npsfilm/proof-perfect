-- Create company role enum
CREATE TYPE public.company_role_t AS ENUM ('owner', 'company_admin', 'employee');

-- Extend company_members table with role and permissions
ALTER TABLE public.company_members 
  ADD COLUMN role company_role_t NOT NULL DEFAULT 'employee',
  ADD COLUMN can_view_invoices BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN can_view_prices BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN can_manage_team BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN invited_by UUID REFERENCES public.profiles(id),
  ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create company_billing table for detailed billing information
CREATE TABLE public.company_billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  billing_name TEXT,
  billing_street TEXT,
  billing_zip TEXT,
  billing_city TEXT,
  billing_country TEXT DEFAULT 'Deutschland',
  vat_id TEXT,
  tax_number TEXT,
  billing_email TEXT,
  bank_name TEXT,
  iban TEXT,
  bic TEXT,
  payment_terms_days INTEGER DEFAULT 14,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table for invoice dashboard
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  amount_cents INTEGER NOT NULL,
  tax_amount_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  pdf_url TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role company_role_t NOT NULL DEFAULT 'employee',
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check company role
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id UUID, _company_id UUID, _roles company_role_t[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role = ANY(_roles)
  )
$$;

-- Helper function to check if user can view invoices
CREATE OR REPLACE FUNCTION public.can_view_company_invoices(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND (
        role IN ('owner', 'company_admin')
        OR can_view_invoices = true
      )
  )
$$;

-- RLS Policies for company_billing
CREATE POLICY "Admins can manage all company billing"
ON public.company_billing FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company owners and admins can manage billing"
ON public.company_billing FOR ALL
USING (has_company_role(auth.uid(), company_id, ARRAY['owner', 'company_admin']::company_role_t[]))
WITH CHECK (has_company_role(auth.uid(), company_id, ARRAY['owner', 'company_admin']::company_role_t[]));

-- RLS Policies for invoices
CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company members with permission can view invoices"
ON public.invoices FOR SELECT
USING (can_view_company_invoices(auth.uid(), company_id));

-- RLS Policies for team_invitations
CREATE POLICY "Admins can manage all invitations"
ON public.team_invitations FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company owners and admins can manage invitations"
ON public.team_invitations FOR ALL
USING (has_company_role(auth.uid(), company_id, ARRAY['owner', 'company_admin']::company_role_t[]))
WITH CHECK (has_company_role(auth.uid(), company_id, ARRAY['owner', 'company_admin']::company_role_t[]));

CREATE POLICY "Anyone can read their own invitation by token"
ON public.team_invitations FOR SELECT
USING (true);

-- Update triggers for updated_at
CREATE TRIGGER update_company_billing_updated_at
BEFORE UPDATE ON public.company_billing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();