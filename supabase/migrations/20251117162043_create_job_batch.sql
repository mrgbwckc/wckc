CREATE OR REPLACE FUNCTION create_job_batch(variant_count int)
RETURNS TABLE (
  job_id bigint, 
  job_suffix text, 
  job_base_number int
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_base_num int;
  current_suffix text;
  new_id bigint;
  i int;
BEGIN
  new_base_num := nextval('job_number_seq');

  FOR i IN 0..(variant_count - 1) LOOP
    
    -- Generate Suffix: 0->A, 1->B...
    current_suffix := chr(65 + i);

    INSERT INTO jobs (job_base_number, job_suffix)
    VALUES (new_base_num, current_suffix)
    RETURNING id INTO new_id;

    job_id := new_id;
    job_suffix := current_suffix;
    job_base_number := new_base_num;

    RETURN NEXT;
  END LOOP;
END;
$$;