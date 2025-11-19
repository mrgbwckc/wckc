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
-- START DECLARE BLOCK
DECLARE
    -- These variables MUST be declared before use:
    new_base_num INT;
    new_suffix TEXT := NULL;
    max_suffix_char TEXT;
    current_job_id BIGINT;
    v_captured_job_number TEXT;
-- END DECLARE BLOCK
BEGIN
    -- 1. DETERMINE BASE NUMBER MODE
    IF p_existing_base_number IS NOT NULL AND p_existing_base_number > 0 THEN
        -- LINKED JOB MODE
        new_base_num := p_existing_base_number;

        -- *** CRITICAL FIX: Ensure the EXISTING base job has suffix 'A' ***
        UPDATE public.jobs
        SET job_suffix = 'A'
        WHERE job_base_number = new_base_num
          AND job_suffix IS NULL
          AND id = (SELECT MIN(id) FROM public.jobs WHERE job_base_number = new_base_num);
        
        -- 2. DETERMINE NEXT SUFFIX (start from the largest existing suffix in the group)
        SELECT MAX(job_suffix) INTO max_suffix_char
        FROM public.jobs
        WHERE job_base_number = new_base_num;
        
        IF max_suffix_char IS NULL OR max_suffix_char = '' THEN
            new_suffix := 'A';
        ELSE
            -- Increment the highest existing suffix (e.g., 'A' becomes 'B')
            new_suffix := chr(ascii(max_suffix_char) + 1);
        END IF;
    ELSE
        -- NEW GROUP MODE: Get next unique number from sequence
        new_base_num := nextval('job_number_seq');
        new_suffix := 'A'; -- Set the first job's suffix to 'A' by default
    END IF;

    -- 3. INSERT NEW JOB ROW AND LINK TO SALES ORDER
    INSERT INTO jobs (job_base_number, job_suffix, sales_order_id)
    VALUES (new_base_num, new_suffix, p_sales_order_id)
    RETURNING id, job_number INTO current_job_id, v_captured_job_number;

    -- 4. RETURN RESULTS
    out_job_id := current_job_id;
    out_job_suffix := new_suffix;
    out_job_base_number := new_base_num;
    out_job_number := v_captured_job_number;

    RETURN NEXT;
END;
$$;