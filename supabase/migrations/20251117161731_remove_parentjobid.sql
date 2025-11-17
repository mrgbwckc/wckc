-- 1. Remove the Parent Link
ALTER TABLE public.jobs DROP COLUMN IF EXISTS parent_job_id;
-- 2. Create Index on job_base_number
CREATE INDEX IF NOT EXISTS idx_jobs_base_number ON public.jobs (job_base_number);