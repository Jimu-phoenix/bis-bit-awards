create table if not exists categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  blurb text not null default '',
  sort_order int not null default 0
);

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
  created_at timestamptz not null default now()
);

create index if not exists nominees_category_id_idx on nominees (category_id);
create index if not exists votes_nominee_id_idx on votes (nominee_id);
