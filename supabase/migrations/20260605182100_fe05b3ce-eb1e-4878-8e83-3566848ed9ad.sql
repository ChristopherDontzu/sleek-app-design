-- Enum pentru categorie
CREATE TYPE public.ride_category AS ENUM ('persoane', 'colet', 'mare', 'oferte');

-- Enum pentru status
CREATE TYPE public.ride_status AS ENUM ('pending', 'accepted', 'cancelled', 'completed');

-- Tabelul ride_requests
CREATE TABLE public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  category public.ride_category NOT NULL DEFAULT 'persoane',
  depart_at TIMESTAMPTZ,
  pax_or_weight NUMERIC,
  price_proposal NUMERIC,
  notes TEXT,
  status public.ride_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ride_requests TO authenticated;
GRANT ALL ON public.ride_requests TO service_role;

ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ride requests"
  ON public.ride_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own ride requests"
  ON public.ride_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own ride requests"
  ON public.ride_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own ride requests"
  ON public.ride_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pentru listare rapidă a cererilor unui user
CREATE INDEX idx_ride_requests_user_created
  ON public.ride_requests (user_id, created_at DESC);

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_ride_requests_updated_at
  BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();