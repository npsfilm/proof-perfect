-- Create clients table for managing client information
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  anrede TEXT CHECK (anrede IN ('Herr', 'Frau', 'Divers')),
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  ansprache TEXT NOT NULL CHECK (ansprache IN ('Du', 'Sie')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Admins can manage all clients"
ON public.clients
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add address field to galleries
ALTER TABLE public.galleries
ADD COLUMN address TEXT;

-- Create gallery_clients junction table to link galleries with clients
CREATE TABLE public.gallery_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gallery_id, client_id)
);

-- Enable RLS
ALTER TABLE public.gallery_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_clients
CREATE POLICY "Admins can manage all gallery clients"
ON public.gallery_clients
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update trigger for clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster client searches
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_nachname ON public.clients(nachname);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);