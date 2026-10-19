create table if not exists categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  blurb text not null default '',
  sort_order int not null default 0
);

create table if not exists users (
  id bigint generated always as identity primary key,
  email text not null unique,
  fullname text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_email_lower_idx on users (lower(email));

create table if not exists sessions (
  id text primary key,
  user_id bigint not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);

create table if not exists nominees (
  id bigint generated always as identity primary key,
  category_id bigint not null references categories (id) on delete cascade,
  name text not null,
  blurb text not null default '',
  sort_order int not null default 0
);

create table if not exists votes (
  id bigint generated always as identity primary key,
  nominee_id bigint not null references nominees (id) on delete cascade,
  category_id bigint not null references categories (id) on delete cascade,
  user_id bigint not null references users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists admins (
  id integer generated always as identity primary key,
  email text not null unique,
  fullname text not null default ''
);

create table if not exists system_logs (
  id bigint generated always as identity primary key,
  user_email text not null,
  action text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

-- Single-row toggle for the public voting period
create table if not exists voting_settings (
  id smallint primary key check (id = 1),
  voting_open boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);

insert into voting_settings (id, voting_open) values (1, true)
  on conflict (id) do nothing;

create index if not exists system_logs_created_at_idx on system_logs (created_at desc);

create index if not exists nominees_category_id_idx on nominees (category_id);
-- A name may only appear once per category (keeps seeding idempotent)
create unique index if not exists nominees_category_name_unique
  on nominees (category_id, name);
create index if not exists votes_nominee_id_idx on votes (nominee_id);
create index if not exists votes_user_id_idx on votes (user_id);
create index if not exists votes_category_id_idx on votes (category_id);
-- Unique constraint: one vote per user per category
create unique index if not exists votes_user_category_unique 
  on votes (user_id, category_id);