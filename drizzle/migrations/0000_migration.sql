CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer text NOT NULL DEFAULT 'oui',
  no_attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.responses TO anon, authenticated;
GRANT ALL ON public.responses TO service_role;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can answer" ON public.responses FOR INSERT TO anon, authenticated WITH CHECK (answer = 'oui' AND no_attempts >= 0 AND no_attempts < 100000);
CREATE POLICY "anyone can read" ON public.responses FOR SELECT TO anon, authenticated USING (true);