-- 1. Create a helper function to get the user's role from the JWT
create or replace function public.clerk_user_role()
returns text
language sql stable
as $$
  select (auth.jwt() ->> 'user_role')::text
$$;

alter table public.client
  enable row level security;

-- 4. Create new ROLE-BASED policies
create policy "Allow all access for admins and designers"
on public.client
for all -- This covers SELECT, INSERT, UPDATE, DELETE
using (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
)
with check (
  public.clerk_user_role() = 'admin' OR
  public.clerk_user_role() = 'designer'
);