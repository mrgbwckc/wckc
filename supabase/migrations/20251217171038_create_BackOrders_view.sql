create or replace view backorders_view as
select
  b.id,
  b.job_id,
  b.comments,
  b.date_entered,
  b.due_date,
  b.complete,
  b.created_at,
  j.job_number,
  so.shipping_client_name,
  so.shipping_street,
  so.shipping_city,
  so.shipping_province,
  so.shipping_zip,
  concat_ws(', ', so.shipping_street, so.shipping_city, so.shipping_province, so.shipping_zip) as site_address
from backorders b
left join jobs j on b.job_id = j.id
left join sales_orders so on j.sales_order_id = so.id;