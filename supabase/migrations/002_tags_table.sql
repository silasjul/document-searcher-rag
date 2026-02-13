-- ============================================================================
-- Migration 002 — Normalised tag system
--
-- Replaces the `tags text[]` column on `files` with a proper `tags` table
-- (per-user, with colors) and a `file_tags` junction table.
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════
-- PART A — New tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Tags (per-user tag library) ─────────────────────────────────────────

create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default 'gray',
  created_at timestamptz not null default now(),

  unique (user_id, name)
);

alter table public.tags enable row level security;

create policy "Users can view own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on public.tags for update
  using (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags for delete
  using (auth.uid() = user_id);


-- ── 2. File ↔ Tag junction table ───────────────────────────────────────────

create table if not exists public.file_tags (
  id      uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,

  unique (file_id, tag_id)
);

alter table public.file_tags enable row level security;

create policy "Users can view file_tags for own files"
  on public.file_tags for select
  using (
    exists (
      select 1 from public.files
      where files.id = file_tags.file_id
        and files.user_id = auth.uid()
    )
  );

create policy "Users can insert file_tags for own files"
  on public.file_tags for insert
  with check (
    exists (
      select 1 from public.files
      where files.id = file_tags.file_id
        and files.user_id = auth.uid()
    )
  );

create policy "Users can delete file_tags for own files"
  on public.file_tags for delete
  using (
    exists (
      select 1 from public.files
      where files.id = file_tags.file_id
        and files.user_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- PART B — Indexes
-- ═══════════════════════════════════════════════════════════════════════════

create index if not exists idx_tags_user_id on public.tags(user_id);
create index if not exists idx_file_tags_file_id on public.file_tags(file_id);
create index if not exists idx_file_tags_tag_id on public.file_tags(tag_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- PART C — Drop the old text[] tags column from files
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'files'
      and column_name = 'tags'
  ) then
    alter table public.files drop column tags;
  end if;
end $$;
