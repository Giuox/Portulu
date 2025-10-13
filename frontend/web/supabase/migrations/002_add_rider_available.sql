ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rider_available boolean DEFAULT false;

CREATE POLICY "riders update own availability" ON public.profiles
  FOR UPDATE
  USING ( (SELECT auth.uid()) = id )
  WITH CHECK ( (SELECT auth.uid()) = id );