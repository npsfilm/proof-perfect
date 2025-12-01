-- Add show_onboarding column to galleries table
ALTER TABLE public.galleries 
ADD COLUMN show_onboarding BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.galleries.show_onboarding IS 'Whether to show the onboarding welcome modal for clients in this gallery';