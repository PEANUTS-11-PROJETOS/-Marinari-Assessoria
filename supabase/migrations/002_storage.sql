-- Storage bucket policies for contratos
-- Run AFTER creating the 'contratos' bucket in Supabase Dashboard (Storage → New bucket → name: contratos, public: false)

create policy "owner_upload" on storage.objects for insert
  with check (
    bucket_id = 'contratos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner_select" on storage.objects for select
  using (
    bucket_id = 'contratos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner_delete" on storage.objects for delete
  using (
    bucket_id = 'contratos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
