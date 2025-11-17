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
    
    -- FIX: Declare a temporary variable to capture the generated job_number string
    v_full_job_num text; 
begin
    -- 1. DETERMINE BASE NUMBER MODE
    if p_existing_base_number is not null and p_existing_base_number > 0 then
        -- LINKED JOB MODE: Reuse existing base number
        new_base_num := p_existing_base_number;

        -- Find the highest current suffix (A, B, etc.)
        SELECT MAX(job_suffix) INTO max_suffix_char
        FROM public.jobs
        WHERE job_base_number = new_base_num;
        
        -- Generate the next suffix
        IF max_suffix_char IS NULL OR max_suffix_char = '' THEN
            new_suffix := 'A';
        ELSE
            -- Increment the character (A -> B, B -> C)
            new_suffix := chr(ascii(max_suffix_char) + 1);
        END IF;

    else
        -- NEW GROUP MODE: Get next unique number from sequence
        new_base_num := nextval('job_number_seq');
        new_suffix := null; -- First job in group has no suffix
    end if;

    -- 2. INSERT NEW JOB ROW
    INSERT INTO jobs (job_base_number, job_suffix)
    VALUES (new_base_num, new_suffix)
    -- FIX: Capture the auto-generated ID (id) and the auto-generated job_number 
    -- into temporary variables to resolve ambiguity.
    RETURNING id, job_number INTO current_job_id, v_full_job_num; 

    -- 3. RETURN RESULTS
    job_id := current_job_id;
    job_suffix := new_suffix;
    job_base_number := new_base_num;
    job_number := v_full_job_num; -- Assign the captured value to the output column
    
    RETURN NEXT;
END;
$$;