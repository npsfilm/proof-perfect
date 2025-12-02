-- Policy 1: Users can read their own booking settings
CREATE POLICY "Users can read own booking_settings"
  ON public.booking_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own booking settings
CREATE POLICY "Users can insert own booking_settings"
  ON public.booking_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own booking settings
CREATE POLICY "Users can update own booking_settings"
  ON public.booking_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own booking settings
CREATE POLICY "Users can delete own booking_settings"
  ON public.booking_settings
  FOR DELETE
  USING (auth.uid() = user_id);