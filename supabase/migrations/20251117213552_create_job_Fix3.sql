DROP FUNCTION IF EXISTS create_job_single(int);

CREATE FUNCTION create_job_single(
    p_existing_base_number int default null
)
returns table (
    job_id bigint, 
    job_suffix text, 
    job_base_number int,
    out_job_number text  -- renamed output column
) 
language plpgsql
security definer 
as $$
declare
    new_base_num int;
    new_suffix text := null;
    max_suffix_char text;
    current_job_id bigint;

    v_captured_job_number text;
begin
    -- 1. DETERMINE BASE NUMBER MODE
    if p_existing_base_number is not null and p_existing_base_number > 0 then
        new_base_num := p_existing_base_number;

        SELECT MAX(job_suffix) INTO max_suffix_char
        FROM public.jobs
        WHERE job_base_number = new_base_num;
        
        IF max_suffix_char IS NULL OR max_suffix_char = '' THEN
            new_suffix := 'A';
        ELSE
            new_suffix := chr(ascii(max_suffix_char) + 1);
        END IF;
    else
        new_base_num := nextval('job_number_seq');
        new_suffix := null;
    end if;

    -- 2. INSERT NEW JOB ROW
    INSERT INTO jobs (job_base_number, job_suffix)
    VALUES (new_base_num, new_suffix)
    RETURNING id, job_number INTO current_job_id, v_captured_job_number;

    -- 3. RETURN RESULTS
    job_id := current_job_id;
    job_suffix := new_suffix;
    job_base_number := new_base_num;
    out_job_number := v_captured_job_number;

    RETURN NEXT;
END;
$$;
