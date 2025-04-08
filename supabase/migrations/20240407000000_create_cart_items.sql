-- Create cart_items table
create table if not exists cart_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now() not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    sample_id uuid references samples(id) on delete cascade not null,
    quantity integer not null check (quantity > 0),
    unique(user_id, sample_id)
);

-- Enable Row Level Security
alter table cart_items enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own cart items" on cart_items;
drop policy if exists "Users can insert their own cart items" on cart_items;
drop policy if exists "Users can update their own cart items" on cart_items;
drop policy if exists "Users can delete their own cart items" on cart_items;

-- Create policies
create policy "Users can view their own cart items"
    on cart_items
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
    on cart_items
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
    on cart_items
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own cart items"
    on cart_items
    for delete
    using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists cart_items_user_id_idx on cart_items(user_id);
create index if not exists cart_items_sample_id_idx on cart_items(sample_id); 