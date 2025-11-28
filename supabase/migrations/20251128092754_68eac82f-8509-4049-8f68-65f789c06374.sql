-- Create photo_annotations table for positioned comments
CREATE TABLE public.photo_annotations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  x_position numeric(5,2) NOT NULL CHECK (x_position >= 0 AND x_position <= 100),
  y_position numeric(5,2) NOT NULL CHECK (y_position >= 0 AND y_position <= 100),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.photo_annotations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all annotations
CREATE POLICY "Admins can manage all annotations"
  ON public.photo_annotations FOR ALL
  USING (has_role(auth.uid(), 'admin'::role_t))
  WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Clients can create annotations in assigned galleries when unlocked
CREATE POLICY "Clients can create annotations in assigned galleries"
  ON public.photo_annotations FOR INSERT
  WITH CHECK (
    auth.uid() = author_user_id AND
    EXISTS (
      SELECT 1 FROM photos p
      JOIN gallery_access ga ON ga.gallery_id = p.gallery_id
      JOIN galleries g ON g.id = p.gallery_id
      WHERE p.id = photo_annotations.photo_id
        AND ga.user_id = auth.uid()
        AND g.is_locked = false
    )
  );

-- Clients can read annotations in assigned galleries
CREATE POLICY "Clients can read annotations in assigned galleries"
  ON public.photo_annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM photos p
      JOIN gallery_access ga ON ga.gallery_id = p.gallery_id
      WHERE p.id = photo_annotations.photo_id
        AND ga.user_id = auth.uid()
    )
  );

-- Clients can delete their own annotations when gallery is unlocked
CREATE POLICY "Clients can delete own annotations when unlocked"
  ON public.photo_annotations FOR DELETE
  USING (
    author_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM photos p
      JOIN galleries g ON g.id = p.gallery_id
      WHERE p.id = photo_annotations.photo_id
        AND g.is_locked = false
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_photo_annotations_updated_at
  BEFORE UPDATE ON public.photo_annotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();