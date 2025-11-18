-- Function to generate the next sequential sales order number
CREATE OR REPLACE FUNCTION generate_next_sales_order_number(p_stage text)
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
        WHEN p_stage = 'SOLD' THEN 'S'
        ELSE 'Q'
    END;
    -- Use a single sequence for all sales orders and prefix it based on the stage
    next_seq_val := nextval('sales_order_sequence'); 
    
    RETURN prefix || '-' || current_year_month || '-' || LPAD(next_seq_val::TEXT, 5, '0');
END;
$$;

-- Create a shared sequence for sales orders
CREATE SEQUENCE sales_order_sequence START 10000; 

-- Modify the sales_orders table (if existing)
ALTER TABLE sales_orders
    ALTER COLUMN sales_order_number DROP DEFAULT,
    ALTER COLUMN sales_order_number DROP NOT NULL;

-- Create a BEFORE INSERT trigger
CREATE OR REPLACE FUNCTION set_sales_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.sales_order_number IS NULL THEN
        NEW.sales_order_number := generate_next_sales_order_number(NEW.stage);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER sales_order_number_trigger
BEFORE INSERT ON sales_orders
FOR EACH ROW
EXECUTE FUNCTION set_sales_order_number();