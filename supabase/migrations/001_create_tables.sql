-- ============================================================================
-- Document Searcher RAG — Supabase schema
-- Run this in the Supabase SQL Editor
--
-- PREREQUISITE: The `files` table and `file_status` enum already exist:
--
--   CREATE TYPE file_status AS ENUM (
--     'pending_upload','uploaded','queued','processing','completed','failed'
--   );
--
--   CREATE TABLE files (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES auth.users(id) NOT NULL,
--     original_name TEXT NOT NULL,
--     storage_path TEXT NOT NULL,
--     status file_status DEFAULT 'pending_upload',
--     error_message TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
--   );
--
--   + moddatetime trigger on updated_at
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════
-- PART A — Patch the existing `files` table
-- ═══════════════════════════════════════════════════════════════════════════

-- Add columns the app needs that don't exist yet.
-- Each is wrapped in a DO block so re-running is safe.

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='files' and column_name='file_size'
  ) then
    alter table public.files add column file_size bigint not null default 0;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='files' and column_name='page_count'
  ) then
    alter table public.files add column page_count integer not null default 0;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='files' and column_name='mime_type'
  ) then
    alter table public.files add column mime_type text not null default 'application/pdf';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='files' and column_name='is_global'
  ) then
    alter table public.files add column is_global boolean not null default false;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='files' and column_name='tags'
  ) then
    alter table public.files add column tags text[] not null default '{}';
  end if;
end $$;


-- RLS policies for `files` (none exist yet)
alter table public.files enable row level security;

create policy "Users can view own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can insert own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Users can update own files"
  on public.files for update
  using (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- PART B — New tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Projects ─────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text not null default '',
  status      text not null default 'active'
              check (status in ('active', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);


-- ── 2. Project ↔ File junction table ────────────────────────────────────────

create table if not exists public.project_documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  file_id     uuid not null references public.files(id) on delete cascade,
  added_at    timestamptz not null default now(),

  unique (project_id, file_id)
);

alter table public.project_documents enable row level security;

create policy "Users can view project documents for own projects"
  on public.project_documents for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_documents.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert project documents for own projects"
  on public.project_documents for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_documents.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete project documents for own projects"
  on public.project_documents for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_documents.project_id
        and projects.user_id = auth.uid()
    )
  );


-- ── 3. Chat sessions ───────────────────────────────────────────────────────

create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "Users can view own chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own chat sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);


-- ── 4. Messages ─────────────────────────────────────────────────────────────

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages in own chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = messages.chat_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = messages.chat_id
        and chat_sessions.user_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- PART C — Triggers & indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- moddatetime trigger for the NEW tables (files already has one)
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.projects
  for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at before update on public.chat_sessions
  for each row execute procedure moddatetime(updated_at);


-- Indexes for common queries
create index if not exists idx_files_user_id on public.files(user_id);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_project_documents_project_id on public.project_documents(project_id);
create index if not exists idx_project_documents_file_id on public.project_documents(file_id);
create index if not exists idx_chat_sessions_project_id on public.chat_sessions(project_id);
create index if not exists idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index if not exists idx_messages_chat_id on public.messages(chat_id);
