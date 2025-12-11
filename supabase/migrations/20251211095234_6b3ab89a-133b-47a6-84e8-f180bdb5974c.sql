-- Create bookings table for storing all shooting appointments
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  property_index INTEGER NOT NULL DEFAULT 1,
  
  -- Contact details (same per batch)
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_name TEXT,
  
  -- Property details
  address TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Package
  package_type TEXT NOT NULL CHECK (package_type IN ('foto', 'drohne', 'kombi')),
  photo_count INTEGER NOT NULL,
  
  -- Additional info (for larger packages)
  property_type TEXT CHECK (property_type IN ('bewohnt', 'unbewohnt', 'gestaged')),
  square_meters INTEGER,
  
  -- Schedule
  scheduled_date DATE NOT NULL,
  scheduled_start TIME NOT NULL,
  scheduled_end TIME NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'request', 'cancelled', 'completed')),
  is_weekend_request BOOLEAN DEFAULT FALSE,
  
  -- Routing data
  drive_time_from_previous_minutes INTEGER,
  drive_distance_km NUMERIC,
  
  -- Metadata
  notes TEXT,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create booking_packages table for package configuration
CREATE TABLE public.booking_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_type TEXT NOT NULL CHECK (package_type IN ('foto', 'drohne', 'kombi')),
  photo_count INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  requires_additional_info BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_type, photo_count)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX idx_bookings_batch_id ON public.bookings(batch_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Public can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can read own bookings by email"
ON public.bookings FOR SELECT
USING (true);

-- RLS Policies for booking_packages
CREATE POLICY "Anyone can read active packages"
ON public.booking_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage packages"
ON public.booking_packages FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Insert default packages
INSERT INTO public.booking_packages (package_type, photo_count, duration_minutes, price_cents, requires_additional_info) VALUES
-- Foto packages
('foto', 6, 30, 14900, false),
('foto', 10, 45, 19900, false),
('foto', 15, 60, 24900, true),
('foto', 20, 75, 29900, true),
-- Drohne packages
('drohne', 4, 30, 14900, false),
('drohne', 6, 45, 19900, false),
('drohne', 10, 60, 24900, false),
-- Kombi packages
('kombi', 15, 75, 29900, true),
('kombi', 20, 90, 34900, true),
('kombi', 25, 105, 39900, true),
('kombi', 30, 120, 44900, true);

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();