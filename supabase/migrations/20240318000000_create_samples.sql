-- Enable PostGIS extension
create extension if not exists postgis;

-- Create samples table
create table if not exists samples (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    type text not null,
    location text not null,
    collection_date date not null,
    storage_condition text not null,
    quantity integer not null check (quantity >= 0),
    price decimal(10,2) not null check (price > 0),
    description text,
    latitude decimal(9,6) not null check (latitude between -90 and 90),
    longitude decimal(9,6) not null check (longitude between -180 and 180),
    hash text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create unique index on hash to prevent duplicates
create unique index if not exists samples_hash_idx on samples(hash);

-- Add a geography column for location
alter table samples add column if not exists geog geography(Point, 4326);

-- Create the updated_at column update function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the geography column
create or replace function update_sample_geography()
returns trigger as $$
begin
    new.geog := geography(st_makepoint(new.longitude, new.latitude));
    return new;
end;
$$ language plpgsql;

-- Drop existing triggers if they exist
drop trigger if exists update_sample_geography on samples;
drop trigger if exists update_samples_updated_at on samples;

-- Create triggers
create trigger update_sample_geography
    before insert or update on samples
    for each row
    execute function update_sample_geography();

create trigger update_samples_updated_at
    before update on samples
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table samples enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can read samples" on samples;
drop policy if exists "Authenticated users can insert samples" on samples;
drop policy if exists "Authenticated users can update samples" on samples;

-- Create policies
create policy "Anyone can read samples"
    on samples for select
    using (true);

create policy "Authenticated users can insert samples"
    on samples for insert
    to authenticated
    with check (true);

create policy "Authenticated users can update samples"
    on samples for update
    to authenticated
    using (true);

-- Create spatial index on the geography column
create index if not exists samples_geog_idx on samples using gist(geog);

-- Recreate the search_samples function
create or replace function search_samples(
    search_term text,
    sample_type text,
    min_price numeric,
    max_price numeric,
    storage text
) returns setof samples as $$
begin
    return query
    select *
    from samples
    where (
        search_term is null
        or name ilike '%' || search_term || '%'
        or description ilike '%' || search_term || '%'
    )
    and (sample_type is null or type = sample_type)
    and (min_price is null or price >= min_price)
    and (max_price is null or price <= max_price)
    and (storage is null or storage_condition = storage);
end;
$$ language plpgsql; 