create table hackathon.users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) null,
  phone character varying(20) not null,
  password_hash character varying(255) null,
  full_name character varying(255) not null,
  role hackathon.user_role not null,
  status hackathon.user_status null default 'active'::hackathon.user_status,
  profile_image_url text null,
  preferred_language character varying(2) null default 'bn'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_login timestamp with time zone null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_phone_key unique (phone)
) TABLESPACE pg_default;

create index IF not exists idx_users_role_status on hackathon.users using btree (role, status) TABLESPACE pg_default;

create trigger create_user_profile_trigger
after INSERT on hackathon.users for EACH row
execute FUNCTION hackathon.create_user_profile ();

create trigger update_users_updated_at BEFORE
update on hackathon.users for EACH row
execute FUNCTION hackathon.update_updated_at_column ();

create table hackathon.user_profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  address text null,
  district character varying(100) null,
  division character varying(100) null,
  coordinates point null,
  organization_type character varying(100) null,
  business_license character varying(100) null,
  ngo_registration_number character varying(100) null,
  ngo_license_url text null,
  established_year integer null,
  website_url text null,
  vehicle_type character varying(50) null,
  max_capacity_kg integer null,
  availability_hours jsonb null,
  verification_status hackathon.verification_status null default 'pending'::hackathon.verification_status,
  verification_documents jsonb null,
  verified_at timestamp with time zone null,
  verified_by uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_available boolean null default true,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_fkey foreign KEY (user_id) references hackathon.users (id) on delete CASCADE,
  constraint user_profiles_verified_by_fkey foreign KEY (verified_by) references hackathon.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_coordinates on hackathon.user_profiles using gist (coordinates) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_verification on hackathon.user_profiles using btree (verification_status, created_at) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_volunteer_available on hackathon.user_profiles using btree (vehicle_type, is_available) TABLESPACE pg_default
where
  (vehicle_type is not null);

create trigger update_user_profiles_updated_at BEFORE
update on hackathon.user_profiles for EACH row
execute FUNCTION hackathon.update_updated_at_column ();

create table hackathon.relief_requests (
  id uuid not null default gen_random_uuid (),
  ngo_id uuid null,
  category hackathon.item_category not null,
  item_name character varying(255) not null,
  description text not null,
  quantity numeric(10, 2) not null,
  unit character varying(50) not null,
  beneficiaries_count integer not null,
  target_demographic character varying(100) null,
  emergency_type character varying(100) null,
  urgency hackathon.urgency_level null default 'medium'::hackathon.urgency_level,
  deadline timestamp with time zone null,
  preferred_delivery_time jsonb null,
  delivery_address text not null,
  delivery_coordinates point not null,
  delivery_instructions text null,
  accessibility_notes text null,
  status hackathon.request_status null default 'pending_validation'::hackathon.request_status,
  validation_score numeric(3, 2) null,
  validation_notes text null,
  validated_at timestamp with time zone null,
  supporting_documents jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint relief_requests_pkey primary key (id),
  constraint relief_requests_ngo_id_fkey foreign KEY (ngo_id) references hackathon.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_requests_coordinates on hackathon.relief_requests using gist (delivery_coordinates) TABLESPACE pg_default;

create index IF not exists idx_requests_status_urgency on hackathon.relief_requests using btree (status, urgency, created_at) TABLESPACE pg_default;

create trigger request_notification_trigger
after INSERT on hackathon.relief_requests for EACH row
execute FUNCTION hackathon.notify_new_request ();

create trigger update_relief_requests_updated_at BEFORE
update on hackathon.relief_requests for EACH row
execute FUNCTION hackathon.update_updated_at_column ();


create table hackathon.matches (
  id uuid not null default gen_random_uuid (),
  donation_id uuid null,
  request_id uuid null,
  compatibility_score numeric(3, 2) null,
  distance_km numeric(8, 2) null,
  urgency_alignment numeric(3, 2) null,
  quantity_fulfillment numeric(3, 2) null,
  status hackathon.match_status null default 'suggested'::hackathon.match_status,
  matched_by character varying(50) null,
  assigned_volunteer_id uuid null,
  assigned_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint matches_pkey primary key (id),
  constraint matches_assigned_volunteer_id_fkey foreign KEY (assigned_volunteer_id) references hackathon.user_profiles (id) on delete CASCADE,
  constraint matches_donation_id_fkey foreign KEY (donation_id) references hackathon.donations (id) on delete CASCADE,
  constraint matches_request_id_fkey foreign KEY (request_id) references hackathon.relief_requests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_matches_status_score on hackathon.matches using btree (status, compatibility_score desc) TABLESPACE pg_default;

create trigger match_notification_trigger
after INSERT on hackathon.matches for EACH row
execute FUNCTION hackathon.notify_new_match ();

create trigger update_matches_updated_at BEFORE
update on hackathon.matches for EACH row
execute FUNCTION hackathon.update_updated_at_column ();

create table hackathon.donations (
  id uuid not null default gen_random_uuid (),
  donor_id uuid null,
  category hackathon.item_category not null,
  item_name character varying(255) not null,
  description text null,
  quantity numeric(10, 2) not null,
  unit character varying(50) not null,
  urgency hackathon.urgency_level null default 'medium'::hackathon.urgency_level,
  expiry_date timestamp with time zone null,
  preparation_time integer null,
  pickup_address text not null,
  pickup_coordinates point not null,
  pickup_instructions text null,
  status hackathon.donation_status null default 'pending_validation'::hackathon.donation_status,
  validation_score numeric(3, 2) null,
  validation_notes text null,
  validated_at timestamp with time zone null,
  validated_by character varying(50) null,
  photos jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  expires_at timestamp with time zone null,
  constraint donations_pkey primary key (id),
  constraint donations_donor_id_fkey foreign KEY (donor_id) references hackathon.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_donations_coordinates on hackathon.donations using gist (pickup_coordinates) TABLESPACE pg_default;

create index IF not exists idx_donations_status_created on hackathon.donations using btree (status, created_at) TABLESPACE pg_default;

create trigger donation_notification_trigger
after INSERT on hackathon.donations for EACH row
execute FUNCTION hackathon.notify_new_donation ();

create trigger update_donations_updated_at BEFORE
update on hackathon.donations for EACH row
execute FUNCTION hackathon.update_updated_at_column ();


create table hackathon.deliveries (
  id uuid not null default gen_random_uuid (),
  match_id uuid null,
  volunteer_id uuid null,
  optimized_route jsonb null,
  estimated_distance_km numeric(8, 2) null,
  estimated_duration_minutes integer null,
  pickup_scheduled_at timestamp with time zone null,
  pickup_actual_at timestamp with time zone null,
  pickup_notes text null,
  delivery_scheduled_at timestamp with time zone null,
  delivery_actual_at timestamp with time zone null,
  delivery_notes text null,
  status hackathon.delivery_status null default 'assigned'::hackathon.delivery_status,
  current_location point null,
  last_location_update timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint deliveries_pkey primary key (id),
  constraint deliveries_match_id_fkey foreign KEY (match_id) references hackathon.matches (id) on delete CASCADE,
  constraint deliveries_volunteer_id_fkey foreign KEY (volunteer_id) references hackathon.user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_deliveries_current_location on hackathon.deliveries using gist (current_location) TABLESPACE pg_default;

create index IF not exists idx_deliveries_status_volunteer on hackathon.deliveries using btree (status, volunteer_id, created_at) TABLESPACE pg_default;

create trigger update_deliveries_updated_at BEFORE
update on hackathon.deliveries for EACH row
execute FUNCTION hackathon.update_updated_at_column ();


create table hackathon.spatial_ref_sys (
  srid integer not null,
  auth_name character varying(256) null,
  auth_srid integer null,
  srtext character varying(2048) null,
  proj4text character varying(2048) null,
  constraint spatial_ref_sys_pkey primary key (srid),
  constraint spatial_ref_sys_srid_check check (
    (
      (srid > 0)
      and (srid <= 998999)
    )
  )
) TABLESPACE pg_default;

create table hackathon.schema_versions (
  id serial not null,
  version character varying(20) not null,
  description text null,
  applied_at timestamp with time zone null default now(),
  constraint schema_versions_pkey primary key (id)
) TABLESPACE pg_default;

create table hackathon.platform_metrics (
  id uuid not null default gen_random_uuid (),
  metric_date date not null,
  donations_submitted integer null default 0,
  donations_validated integer null default 0,
  requests_submitted integer null default 0,
  matches_created integer null default 0,
  deliveries_completed integer null default 0,
  avg_validation_time_minutes numeric(8, 2) null,
  avg_matching_time_minutes numeric(8, 2) null,
  avg_delivery_time_hours numeric(8, 2) null,
  success_rate_percentage numeric(5, 2) null,
  active_districts jsonb null,
  total_distance_km numeric(10, 2) null,
  created_at timestamp with time zone null default now(),
  constraint platform_metrics_pkey primary key (id),
  constraint platform_metrics_metric_date_key unique (metric_date)
) TABLESPACE pg_default;

create index IF not exists idx_platform_metrics_date on hackathon.platform_metrics using btree (metric_date desc) TABLESPACE pg_default;

create table hackathon.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  title character varying(255) not null,
  message text not null,
  notification_type hackathon.notification_type not null,
  sent_in_app boolean null default true,
  sent_sms boolean null default false,
  sent_email boolean null default false,
  read_at timestamp with time zone null,
  dismissed_at timestamp with time zone null,
  related_entity_type character varying(50) null,
  related_entity_id uuid null,
  created_at timestamp with time zone null default now(),
  recipient_id uuid null,
  event_type character varying(100) null,
  channel character varying(20) null default 'app'::character varying,
  language character varying(10) null default 'en'::character varying,
  subject character varying(255) null,
  ai_generated boolean null default false,
  ai_confidence numeric(3, 2) null,
  ai_reasoning text null,
  metadata jsonb null,
  status character varying(20) null default 'pending'::character varying,
  delivered_at timestamp with time zone null,
  error_message text null,
  constraint notifications_pkey primary key (id),
  constraint notifications_recipient_id_fkey foreign KEY (recipient_id) references hackathon.users (id) on delete CASCADE,
  constraint notifications_user_id_fkey foreign KEY (user_id) references hackathon.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_unread on hackathon.notifications using btree (user_id, read_at) TABLESPACE pg_default
where
  (read_at is null);

create index IF not exists idx_notifications_ai_generated on hackathon.notifications using btree (ai_generated) TABLESPACE pg_default;

create index IF not exists idx_notifications_recipient_event on hackathon.notifications using btree (recipient_id, event_type) TABLESPACE pg_default;

create index IF not exists idx_notifications_status on hackathon.notifications using btree (status) TABLESPACE pg_default;

create index IF not exists idx_notifications_channel on hackathon.notifications using btree (channel) TABLESPACE pg_default;

create view hackathon.geometry_columns as
select
  current_database()::character varying(256) as f_table_catalog,
  n.nspname as f_table_schema,
  c.relname as f_table_name,
  a.attname as f_geometry_column,
  COALESCE(
    hackathon.postgis_typmod_dims (a.atttypmod),
    sn.ndims,
    2
  ) as coord_dimension,
  COALESCE(
    NULLIF(hackathon.postgis_typmod_srid (a.atttypmod), 0),
    sr.srid,
    0
  ) as srid,
  replace(
    replace(
      COALESCE(
        NULLIF(
          upper(hackathon.postgis_typmod_type (a.atttypmod)),
          'GEOMETRY'::text
        ),
        st.type,
        'GEOMETRY'::text
      ),
      'ZM'::text,
      ''::text
    ),
    'Z'::text,
    ''::text
  )::character varying(30) as type
from
  pg_class c
  join pg_attribute a on a.attrelid = c.oid
  and not a.attisdropped
  join pg_namespace n on c.relnamespace = n.oid
  join pg_type t on a.atttypid = t.oid
  left join (
    select
      s.connamespace,
      s.conrelid,
      s.conkey,
      replace(
        split_part(s.consrc, ''''::text, 2),
        ')'::text,
        ''::text
      ) as type
    from
      (
        select
          pg_constraint.connamespace,
          pg_constraint.conrelid,
          pg_constraint.conkey,
          pg_get_constraintdef(pg_constraint.oid) as consrc
        from
          pg_constraint
      ) s
    where
      s.consrc ~~* '%geometrytype(% = %'::text
  ) st on st.connamespace = n.oid
  and st.conrelid = c.oid
  and (a.attnum = any (st.conkey))
  left join (
    select
      s.connamespace,
      s.conrelid,
      s.conkey,
      replace(
        split_part(s.consrc, ' = '::text, 2),
        ')'::text,
        ''::text
      )::integer as ndims
    from
      (
        select
          pg_constraint.connamespace,
          pg_constraint.conrelid,
          pg_constraint.conkey,
          pg_get_constraintdef(pg_constraint.oid) as consrc
        from
          pg_constraint
      ) s
    where
      s.consrc ~~* '%ndims(% = %'::text
  ) sn on sn.connamespace = n.oid
  and sn.conrelid = c.oid
  and (a.attnum = any (sn.conkey))
  left join (
    select
      s.connamespace,
      s.conrelid,
      s.conkey,
      replace(
        replace(
          split_part(s.consrc, ' = '::text, 2),
          ')'::text,
          ''::text
        ),
        '('::text,
        ''::text
      )::integer as srid
    from
      (
        select
          pg_constraint.connamespace,
          pg_constraint.conrelid,
          pg_constraint.conkey,
          pg_get_constraintdef(pg_constraint.oid) as consrc
        from
          pg_constraint
      ) s
    where
      s.consrc ~~* '%srid(% = %'::text
  ) sr on sr.connamespace = n.oid
  and sr.conrelid = c.oid
  and (a.attnum = any (sr.conkey))
where
  (
    c.relkind = any (
      array[
        'r'::"char",
        'v'::"char",
        'm'::"char",
        'f'::"char",
        'p'::"char"
      ]
    )
  )
  and not c.relname = 'raster_columns'::name
  and t.typname = 'geometry'::name
  and not pg_is_other_temp_schema(c.relnamespace)
  and has_table_privilege(c.oid, 'SELECT'::text);

create view hackathon.geography_columns as
select
  current_database() as f_table_catalog,
  n.nspname as f_table_schema,
  c.relname as f_table_name,
  a.attname as f_geography_column,
  hackathon.postgis_typmod_dims (a.atttypmod) as coord_dimension,
  hackathon.postgis_typmod_srid (a.atttypmod) as srid,
  hackathon.postgis_typmod_type (a.atttypmod) as type
from
  pg_class c,
  pg_attribute a,
  pg_type t,
  pg_namespace n
where
  t.typname = 'geography'::name
  and a.attisdropped = false
  and a.atttypid = t.oid
  and a.attrelid = c.oid
  and c.relnamespace = n.oid
  and (
    c.relkind = any (
      array[
        'r'::"char",
        'v'::"char",
        'm'::"char",
        'f'::"char",
        'p'::"char"
      ]
    )
  )
  and not pg_is_other_temp_schema(c.relnamespace)
  and has_table_privilege(c.oid, 'SELECT'::text);



create table hackathon.emergency_events (
  id uuid not null default gen_random_uuid (),
  event_type character varying(100) not null,
  event_name character varying(255) null,
  affected_areas jsonb null,
  severity_level integer null,
  estimated_affected_population integer null,
  started_at timestamp with time zone null,
  ended_at timestamp with time zone null,
  priority_boost_active boolean null default true,
  special_routing_rules jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint emergency_events_pkey primary key (id),
  constraint emergency_events_severity_level_check check (
    (
      (severity_level >= 1)
      and (severity_level <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_emergency_events_active on hackathon.emergency_events using btree (priority_boost_active, started_at) TABLESPACE pg_default
where
  (ended_at is null);

create table hackathon.delivery_confirmations (
  id uuid not null default gen_random_uuid (),
  delivery_id uuid null,
  recipient_name character varying(255) null,
  recipient_phone character varying(20) null,
  recipient_signature_url text null,
  delivery_photos jsonb null,
  recipient_feedback text null,
  quality_rating integer null,
  confirmed_by uuid null,
  confirmed_at timestamp with time zone null default now(),
  notes text null,
  created_at timestamp with time zone null default now(),
  constraint delivery_confirmations_pkey primary key (id),
  constraint delivery_confirmations_confirmed_by_fkey foreign KEY (confirmed_by) references hackathon.users (id),
  constraint delivery_confirmations_delivery_id_fkey foreign KEY (delivery_id) references hackathon.deliveries (id) on delete CASCADE,
  constraint delivery_confirmations_quality_rating_check check (
    (
      (quality_rating >= 1)
      and (quality_rating <= 5)
    )
  )
) TABLESPACE pg_default;


create table hackathon.chat_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  session_type character varying(50) null,
  language character varying(2) null default 'bn'::character varying,
  started_at timestamp with time zone null default now(),
  ended_at timestamp with time zone null,
  satisfaction_rating integer null,
  constraint chat_sessions_pkey primary key (id),
  constraint chat_sessions_user_id_fkey foreign KEY (user_id) references hackathon.users (id) on delete CASCADE,
  constraint chat_sessions_satisfaction_rating_check check (
    (
      (satisfaction_rating >= 1)
      and (satisfaction_rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_chat_sessions_user on hackathon.chat_sessions using btree (user_id, started_at desc) TABLESPACE pg_default;

create table hackathon.chat_messages (
  id uuid not null default gen_random_uuid (),
  session_id uuid null,
  sender_type character varying(20) null,
  message_text text not null,
  message_type character varying(20) null,
  audio_url text null,
  audio_duration_seconds integer null,
  transcription text null,
  intent character varying(100) null,
  confidence_score numeric(3, 2) null,
  created_at timestamp with time zone null default now(),
  constraint chat_messages_pkey primary key (id),
  constraint chat_messages_session_id_fkey foreign KEY (session_id) references hackathon.chat_sessions (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_session on hackathon.chat_messages using btree (session_id, created_at) TABLESPACE pg_default;

create table hackathon.agent_processes (
  id uuid not null default gen_random_uuid (),
  agent_type hackathon.agent_type not null,
  entity_type character varying(50) null,
  entity_id uuid null,
  input_data jsonb null,
  output_data jsonb null,
  confidence_score numeric(3, 2) null,
  processing_time_ms integer null,
  status hackathon.process_status null,
  error_message text null,
  created_at timestamp with time zone null default now(),
  constraint agent_processes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_agent_processes_type_status on hackathon.agent_processes using btree (agent_type, status, created_at) TABLESPACE pg_default;
