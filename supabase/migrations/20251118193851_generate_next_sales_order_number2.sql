-- Create necessary sequence for the sales order number
CREATE SEQUENCE IF NOT EXISTS sales_order_sequence START 10000;

---

-- 1. FUNCTION: generate_next_sales_order_number(p_stage "SalesStage")
-- This function generates the next sequential sales order number, 
-- prepending 'S' or 'Q' based on the "SalesStage" type.
-- Note: The signature explicitly uses the custom type "SalesStage" to match 
-- the trigger's call, which resolves the 42883 error.
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
    
    -- Cast the input "SalesStage" type to TEXT for use in the CASE statement
    prefix := CASE
        WHEN p_stage::TEXT = 'SOLD' THEN 'S'
        ELSE 'Q'
    END;
    
    next_seq_val := nextval('sales_order_sequence'); 
    
    -- Format: Prefix-YYMM-##### (e.g., S-2511-10000)
    RETURN prefix || '-' || current_year_month || '-' || LPAD(next_seq_val::TEXT, 5, '0');
END;
$$;

---

-- 2. TRIGGER FUNCTION: set_sales_order_number()
-- This trigger function checks if sales_order_number is null and calls 
-- the generator function if it is.
CREATE OR REPLACE FUNCTION set_sales_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if the client didn't supply a number (i.e., it's null during INSERT)
    IF NEW.sales_order_number IS NULL THEN
        NEW.sales_order_number := generate_next_sales_order_number(NEW.stage); 
    END IF;
    RETURN NEW;
END;
$$;

---

-- 3. APPLY CHANGES & TRIGGER: sales_orders table

-- A. If the column 'sales_order_number' already exists and is NOT NULL, 
-- we must remove the constraints temporarily before applying the new trigger mechanism.
-- (Only run this part if you are modifying an existing table)
ALTER TABLE sales_orders
    ALTER COLUMN sales_order_number DROP NOT NULL,
    ALTER COLUMN sales_order_number DROP DEFAULT;

-- B. Drop and re-create the trigger to ensure it uses the latest function definition
DROP TRIGGER IF EXISTS sales_order_number_trigger ON sales_orders;

CREATE TRIGGER sales_order_number_trigger
BEFORE INSERT ON sales_orders
FOR EACH ROW
EXECUTE FUNCTION set_sales_order_number();

-- C. OPTIONAL: If desired, re-add NOT NULL constraint (must be done after 
-- the trigger is active and ensures non-null values for all subsequent inserts)
-- ALTER TABLE sales_orders
--    ALTER COLUMN sales_order_number SET NOT NULL;