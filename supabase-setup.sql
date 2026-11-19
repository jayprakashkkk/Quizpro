-- Supabase Dashboard -> SQL Editor -> New query me paste karke "Run" dabayein (sirf ek baar)
create table if not exists public.quiz_attempts (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  id bigint not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.quiz_attempts enable row level security;

create policy "users read own attempts" on public.quiz_attempts
  for select to authenticated using (auth.uid() = user_id);

create policy "users insert own attempts" on public.quiz_attempts
  for insert to authenticated with check (auth.uid() = user_id);
