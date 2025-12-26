alter policy "Enable delete for admin only"
on "public"."invoices"
to public
using (
  lower(public.clerk_user_role()) IN ('admin', 'reception')
);