-- Create a flattened view for efficient server-side pagination of the Production Schedule
CREATE OR REPLACE VIEW "public"."prod_table_view" AS
SELECT
    j.id,
    j.job_number,
    ps.rush,
    ps.received_date,
    ps.placement_date,
    ps.ship_schedule,
    ps.ship_status,
    ps.prod_id,
    so.shipping_client_name,
    concat_ws(', ', so.shipping_street, so.shipping_city, so.shipping_province, so.shipping_zip) AS site_address,
    cab.box as cabinet_box,
    s."Species" as cabinet_species,
    c."Name" as cabinet_color,
    ds.name as cabinet_door_style

FROM jobs j
JOIN production_schedule ps ON j.prod_id = ps.prod_id
LEFT JOIN sales_orders so ON j.sales_order_id = so.id
LEFT JOIN cabinets cab ON so.cabinet_id = cab.id
LEFT JOIN species s ON cab.species_id = s."Id"
LEFT JOIN colors c ON cab.color_id = c."Id"
LEFT JOIN door_styles ds ON cab.door_style_id = ds.id;