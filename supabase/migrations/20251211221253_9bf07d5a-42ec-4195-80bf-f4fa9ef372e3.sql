-- Create feature_requests table
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'planned', 'completed', 'rejected')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feature requests
CREATE POLICY "Users can create feature requests"
ON public.feature_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can read their own feature requests
CREATE POLICY "Users can read own feature requests"
ON public.feature_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all feature requests
CREATE POLICY "Admins can manage all feature requests"
ON public.feature_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Create index for common queries
CREATE INDEX idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX idx_feature_requests_user_id ON public.feature_requests(user_id);
CREATE INDEX idx_feature_requests_created_at ON public.feature_requests(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for feature request images
INSERT INTO storage.buckets (id, name, public) VALUES ('feature-requests', 'feature-requests', false);

-- Storage policies for feature request images
CREATE POLICY "Users can upload feature request images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'feature-requests' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own feature request images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feature-requests' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can read all feature request images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feature-requests' AND has_role(auth.uid(), 'admin'::role_t));