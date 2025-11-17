-- ---
-- 4. APPLYING POLICIES TO CLIENT TABLE
-- ---

alter table public.client enable row level security;

-- Policy 1: SELECT
create policy "Allow SELECT for Admins and Designers on Client"
on public.client
for select
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 2: INSERT
create policy "Allow INSERT for Admins and Designers on Client"
on public.client
for insert
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 3: UPDATE
create policy "Allow UPDATE for Admins and Designers on Client"
on public.client
for update
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
)
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- ---
-- 5. APPLYING POLICIES TO CABINETS TABLE
-- ---

alter table public.cabinets enable row level security;

-- Policy 4: SELECT
create policy "Allow SELECT for Admins and Designers on Cabinets"
on public.cabinets
for select
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 5: INSERT
create policy "Allow INSERT for Admins and Designers on Cabinets"
on public.cabinets
for insert
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 6: UPDATE
create policy "Allow UPDATE for Admins and Designers on Cabinets"
on public.cabinets
for update
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
)
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- ---
-- 6. APPLYING POLICIES TO JOBS TABLE
-- ---

alter table public.jobs enable row level security;

-- Policy 7: SELECT
create policy "Allow SELECT for Admins and Designers on Jobs"
on public.jobs
for select
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 8: INSERT
create policy "Allow INSERT for Admins and Designers on Jobs"
on public.jobs
for insert
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 9: UPDATE
create policy "Allow UPDATE for Admins and Designers on Jobs"
on public.jobs
for update
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
)
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- ---
-- 7. APPLYING POLICIES TO SALES ORDERS TABLE
-- ---

alter table public.sales_orders enable row level security;

-- Policy 10: SELECT
create policy "Allow SELECT for Admins and Designers on Sales Orders"
on public.sales_orders
for select
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 11: INSERT
create policy "Allow INSERT for Admins and Designers on Sales Orders"
on public.sales_orders
for insert
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);

-- Policy 12: UPDATE
create policy "Allow UPDATE for Admins and Designers on Sales Orders"
on public.sales_orders
for update
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
)
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);