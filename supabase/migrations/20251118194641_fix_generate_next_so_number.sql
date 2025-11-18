CREATE OR REPLACE FUNCTION generate_next_sales_order_number(p_stage "SalesStage")
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_year_month TEXT;
    prefix TEXT;
    next_seq_val BIGINT;
BEGIN
    current_year_month := TO_CHAR(CURRENT_DATE, 'YYMM');
    prefix := CASE
        WHEN p_stage::TEXT = 'SOLD' THEN 'S'
        ELSE 'Q'
    END;
    
    next_seq_val := nextval('sales_order_sequence'); 
    
    RETURN prefix || '-' || current_year_month || '-' || next_seq_val::TEXT;
END;
$$;