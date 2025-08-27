-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- roles enum
do $$ begin
  create type org_role as enum ('owner','admin','editor','analyst','viewer');
exception when duplicate_object then null; end $$;

-- organization_members
create table if not exists organization_members (
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid not null, -- maps to auth.users.id
  role org_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- agents (MVP config only)
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  language text not null default 'de-DE',
  system_prompt text not null,
  elevenlabs_voice_id text not null,
  created_by uuid not null, -- auth.users.id
  created_at timestamptz not null default now()
);

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table agents enable row level security;

-- RLS policies (simplified: member can read org + agents in their org; write per role)
create policy org_read on organizations for select
  using (exists (select 1 from organization_members m where m.org_id = id and m.user_id = auth.uid()));

create policy org_member_read on organization_members for select
  using (user_id = auth.uid() or exists (select 1 from organization_members m where m.org_id = organization_members.org_id and m.user_id = auth.uid()));

create policy agent_read on agents for select
  using (exists (select 1 from organization_members m where m.org_id = agents.org_id and m.user_id = auth.uid()));

-- writes via RPC (safer) – for MVP allow role-based upserts
create policy agent_write on agents for insert with check (
  exists (select 1 from organization_members m where m.org_id = agents.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','editor'))
);
create policy agent_update on agents for update using (
  exists (select 1 from organization_members m where m.org_id = agents.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','editor'))
);

-- Organization creation policy
create policy org_insert on organizations for insert with check (true);

-- Organization member policies
create policy org_member_insert on organization_members for insert with check (
  user_id = auth.uid() or 
  exists (select 1 from organization_members m where m.org_id = organization_members.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

create policy org_member_update on organization_members for update using (
  exists (select 1 from organization_members m where m.org_id = organization_members.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- Function to bootstrap user organization
create or replace function bootstrap_user_organization()
returns trigger as $$
declare
  org_id uuid;
  email_local text;
begin
  -- Extract local part of email for org name
  email_local := split_part(NEW.email, '@', 1);
  
  -- Create organization
  insert into organizations (name) 
  values (email_local || '''s Organization') 
  returning id into org_id;
  
  -- Add user as owner
  insert into organization_members (org_id, user_id, role)
  values (org_id, NEW.id, 'owner');
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create org on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure bootstrap_user_organization();
