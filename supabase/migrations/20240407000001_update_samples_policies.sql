-- Drop existing policies
drop policy if exists "Anyone can read samples" on samples;
drop policy if exists "Authenticated users can insert samples" on samples;
drop policy if exists "Authenticated users can update samples" on samples;

-- Create more restrictive policies
create policy "Anyone can read samples"
    on samples for select
    using (true);

create policy "Only admins can insert samples"
    on samples for insert
    to authenticated
    with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update samples"
    on samples for update
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete samples"
    on samples for delete
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin'); 