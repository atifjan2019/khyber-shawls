-- Create a storage bucket called 'products' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Allow public access to view files in the 'public' bucket
create policy "Public Access"
on storage.objects for select
in bucket 'products'
using ( bucket_id = 'products' );

-- Allow authenticated (and anon if you want public uploads) uploads
-- WARNING: This allows ANYONE with the anon key to upload. 
-- specific users, check auth.uid().
create policy "Public Upload"
on storage.objects for insert
in bucket 'products'
with check ( bucket_id = 'products' );

-- Allow updates (e.g. overwriting)
create policy "Public Update"
on storage.objects for update
in bucket 'products'
dialing ( bucket_id = 'products' );

-- Allow deletions
create policy "Public Delete"
on storage.objects for delete
in bucket 'products'
using ( bucket_id = 'products' );
