-- =====================================================================
-- Sun Moon Investigators Pvt Ltd — full reset & user seed script
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- AFTER your schema (profiles / cases / case_progress / reports tables
-- and RLS policies) has already been created.
--
-- WARNING: this WIPES all existing users and app data before reseeding.
-- Only run this on a dev/staging project, or when you intentionally
-- want to reset to just the people listed below.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Wipe existing data (children first, to satisfy foreign keys)
-- ---------------------------------------------------------------------
delete from public.reports;
delete from public.case_progress;
delete from public.cases;
delete from public.profiles;
delete from auth.identities;
delete from auth.users;

-- ---------------------------------------------------------------------
-- 2. Seed the admin account
-- ---------------------------------------------------------------------
do $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := 'admin@sunmoongroup.in';
  v_password text := 'Admin@Sun2026';
begin
  insert into auth.users
    (id, instance_id, aud, role, email, encrypted_password,
     email_confirmed_at, created_at, updated_at,
     raw_app_meta_data, raw_user_meta_data)
  values
    (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     v_email, crypt(v_password, gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}');

  insert into auth.identities
    (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values
    (gen_random_uuid(), v_id, v_id::text,
     jsonb_build_object('sub', v_id::text, 'email', v_email),
     'email', now(), now(), now());

  insert into public.profiles (id, full_name, email, role, location, is_active)
  values (v_id, 'Admin', v_email, 'admin', null, true);
end $$;

-- ---------------------------------------------------------------------
-- 3. Seed all 20 agents (name, location, email, password)
-- ---------------------------------------------------------------------
do $$
declare
  agent record;
  v_id uuid;
begin
  for agent in
    select * from (values
      ('Dinesh',            'MADURAI CIRCLE',       'dinesh@sunmoongroup.in',           'Dinesh@Sun2026'),
      ('Muthu Kumar',       'TIRUNELVELI CIRCLE',   'muthu.kumar@sunmoongroup.in',      'MuthuKumar@Sun2026'),
      ('Muthu Mahalingam',  'MADURAI CIRCLE',       'muthu.mahalingam@sunmoongroup.in', 'MuthuMahalingam@Sun2026'),
      ('Rajasekhar',        'MYLADURAI',            'rajasekhar@sunmoongroup.in',       'Rajasekhar@Sun2026'),
      ('Ramachandran',      'SALEM CIRCLE',         'ramachandran@sunmoongroup.in',     'Ramachandran@Sun2026'),
      ('Ramesh',            'TIRUPPUR',             'ramesh@sunmoongroup.in',           'Ramesh@Sun2026'),
      ('Ramkumar',          'COIMBATORE',           'ramkumar@sunmoongroup.in',         'Ramkumar@Sun2026'),
      ('Rudran',            'THENI',                'rudran@sunmoongroup.in',           'Rudran@Sun2026'),
      ('Saravanan',         'POLLACHI CIRCLE',      'saravanan@sunmoongroup.in',        'Saravanan@Sun2026'),
      ('Sasi',              'COIMBATORE',           'sasi@sunmoongroup.in',             'Sasi@Sun2026'),
      ('Sathish',           'NILGIRIS',             'sathish@sunmoongroup.in',          'Sathish@Sun2026'),
      ('Mohan',             'SATHYAMANGALAM',       'mohan@sunmoongroup.in',            'Mohan@Sun2026'),
      ('Vignesh Cudd',      'CUDDALORE, CHENNAI',   'vignesh.cudd@sunmoongroup.in',     'VigneshCudd@Sun2026'),
      ('Vignesh K',         'THANJAVUR CIRCLE',     'vignesh.k@sunmoongroup.in',        'VigneshK@Sun2026'),
      ('Vimal',             'CHENNAI',              'vimal@sunmoongroup.in',            'Vimal@Sun2026'),
      ('Vimaresh',          'THANJAVUR CIRCLE',     'vimaresh@sunmoongroup.in',         'Vimaresh@Sun2026'),
      ('Babu A',            'PALAKKAD',             'babu.a@sunmoongroup.in',           'BabuA@Sun2026'),
      ('Shafeeq',           'MALAPPURAM',           'shafeeq@sunmoongroup.in',          'Shafeeq@Sun2026'),
      ('Kiran',             'TRIVANDRUM',           'kiran@sunmoongroup.in',            'Kiran@Sun2026'),
      ('Yadhu',             'COCHIN',               'yadhu@sunmoongroup.in',            'Yadhu@Sun2026')
    ) as t(full_name, location, email, password)
  loop
    v_id := gen_random_uuid();

    insert into auth.users
      (id, instance_id, aud, role, email, encrypted_password,
       email_confirmed_at, created_at, updated_at,
       raw_app_meta_data, raw_user_meta_data)
    values
      (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       agent.email, crypt(agent.password, gen_salt('bf')),
       now(), now(), now(),
       '{"provider":"email","providers":["email"]}', '{}');

    insert into auth.identities
      (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values
      (gen_random_uuid(), v_id, v_id::text,
       jsonb_build_object('sub', v_id::text, 'email', agent.email),
       'email', now(), now(), now());

    insert into public.profiles (id, full_name, email, role, location, is_active)
    values (v_id, agent.full_name, agent.email, 'agent', agent.location, true);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Done. 1 admin + 20 agents now exist, pre-confirmed, ready to log in
-- at /login with the emails/passwords listed in the credentials sheet.
-- ---------------------------------------------------------------------
