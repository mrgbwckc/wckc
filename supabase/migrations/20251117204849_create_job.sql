-- Migration: create_job_single_rpc.sql

-- 1. CLEANUP: Drop the previous batch function to prevent confusion
DROP FUNCTION IF EXISTS create_job_batch(variant_count int);

-- 2. CREATE JOB SINGLE RPC
-- Creates a single job row, reusing a provided base number if available, 
-- or generating a new one if not (New Group Mode).
create or replace function create_job_single(
    p_existing_base_number int default null
)
returns table (
    job_id bigint, 
    job_suffix text, 
    job_base_number int,
    job_number text 
) 
language plpgsql
security definer -- Needed to execute nextval
as $$
declare
    new_base_num int;
    new_suffix text := null;
    max_suffix_char text;
    current_job_id bigint;
begin
    -- 1. DETERMINE BASE NUMBER MODE
    if p_existing_base_number is not null and p_existing_base_number > 0 then
        -- LINKED JOB MODE (If called by a "Add Related Job" action later)
        new_base_num := p_existing_base_number;

        -- Find the highest current suffix (A, B, etc.) and generate the next one
        SELECT MAX(job_suffix) INTO max_suffix_char
        FROM public.jobs
        WHERE job_base_number = new_base_num;
        
        -- Default: If max_suffix_char is null (e.g., job 40001 was created without a suffix 'A'), 
        -- we treat the first sibling as 'A'. If 'A' exists, we go to 'B'.
        IF max_suffix_char IS NULL OR max_suffix_char = '' THEN
            new_suffix := 'A';
        ELSE
            -- Increment the character (A -> B, B -> C)
            new_suffix := chr(ascii(max_suffix_char) + 1);
        END IF;

    else
        -- NEW GROUP MODE (Called on initial order submission)
        -- Get next unique number from sequence
        new_base_num := nextval('job_number_seq');
        new_suffix := null; -- First job in group has no suffix (e.g., '40001')
    end if;

    -- 2. INSERT NEW JOB ROW
    INSERT INTO jobs (job_base_number, job_suffix)
    VALUES (new_base_num, new_suffix)
    RETURNING id, job_number INTO current_job_id, job_number;

    -- 3. RETURN RESULTS
    job_id := current_job_id;
    job_suffix := new_suffix;
    job_base_number := new_base_num;
    RETURN NEXT;
END;
$$;