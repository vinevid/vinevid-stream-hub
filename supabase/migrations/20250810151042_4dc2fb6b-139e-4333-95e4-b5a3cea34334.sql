-- Ensure site_settings row exists
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Add the provided email to the admin whitelist without duplications
update public.site_settings
set allowed_admin_emails = (
  select array_agg(distinct x)
  from unnest(coalesce(allowed_admin_emails, '{}'::text[]) || array['vinevid@admin.com']) as t(x)
)
where id = 1;