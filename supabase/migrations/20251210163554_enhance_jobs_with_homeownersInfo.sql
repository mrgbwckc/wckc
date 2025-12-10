create table if not exists homeowners_info (
    id bigint generated always as identity primary key,
    job_id bigint not null references jobs(id),
    homeowner_name text,
    homeowner_phone text,
    homeowner_email text,
    created_at timestamp with time zone default now()
);