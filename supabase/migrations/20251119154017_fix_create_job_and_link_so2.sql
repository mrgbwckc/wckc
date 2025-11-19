

-- Drop the function if it exists to allow CREATE OR REPLACE
DROP FUNCTION IF EXISTS public.create_job_and_link_so(bigint, integer);

CREATE OR REPLACE FUNCTION public.create_job_and_link_so(
    p_sales_order_id bigint, 
    p_existing_base_number integer DEFAULT NULL::integer
) 
RETURNS TABLE(
    out_job_id bigint, 
    out_job_suffix text, 
    out_job_base_number integer, 
    out_job_number text
) 
LANGUAGE plpgsql
AS $$
-- DECLARE block is mandatory for all local variables
DECLARE
    new_base_num INT;
    new_suffix TEXT := NULL;
    max_suffix_char TEXT;
    current_job_id BIGINT;
    v_captured_job_number TEXT;
BEGIN
    -- 1. DETERMINE BASE NUMBER MODE
    IF p_existing_base_number IS NOT NULL AND p_existing_base_number > 0 THEN
        -- LINKED JOB MODE: Adding a sub-job to an existing base number (e.g., 40017-B)
        new_base_num := p_existing_base_number;

        -- CRITICAL FIX: Ensure the EXISTING original base job (suffix IS NULL) 
        -- is updated to have the suffix 'A'.
        UPDATE public.jobs
        SET job_suffix = 'A'
        WHERE job_base_number = new_base_num
          AND job_suffix IS NULL
          AND id = (SELECT MIN(id) FROM public.jobs WHERE job_base_number = new_base_num);
        
        -- Get the highest suffix in the group (which is now at least 'A')
        SELECT MAX(job_suffix) INTO max_suffix_char
        FROM public.jobs
        WHERE job_base_number = new_base_num;
        
        -- Calculate the next suffix (e.g., 'A' + 1 = 'B')
        IF max_suffix_char IS NULL OR max_suffix_char = '' THEN
            new_suffix := 'A';
        ELSE
            new_suffix := chr(ascii(max_suffix_char) + 1);
        END IF;
    ELSE
        -- NEW GROUP MODE: Creating the first job in a new group (e.g., 40018)
        new_base_num := nextval('job_number_seq');
        new_suffix := NULL; -- FIX: The first job should have a NULL suffix (no -A)
    END IF;

    -- 2. INSERT NEW JOB ROW AND LINK TO SALES ORDER
    INSERT INTO jobs (job_base_number, job_suffix, sales_order_id)
    VALUES (new_base_num, new_suffix, p_sales_order_id)
    RETURNING id, job_number INTO current_job_id, v_captured_job_number;

    -- 3. RETURN RESULTS
    out_job_id := current_job_id;
    out_job_suffix := new_suffix;
    out_job_base_number := new_base_num;
    out_job_number := v_captured_job_number;

    RETURN NEXT;
END;
$$;