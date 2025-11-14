
ALTER TABLE public.client
ALTER COLUMN "updatedAt"
SET DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS on_client_updated ON public.client; 
CREATE TRIGGER on_client_updated
  BEFORE UPDATE ON public.client
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();