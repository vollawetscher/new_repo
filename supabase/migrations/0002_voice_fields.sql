-- Add voice tuning fields to agents table
alter table agents add column if not exists voice_stability numeric check (voice_stability between 0 and 1) default 0.5;
alter table agents add column if not exists voice_similarity_boost numeric check (voice_similarity_boost between 0 and 1) default 0.5;
alter table agents add column if not exists voice_style text;

-- Add comment for clarity
comment on column agents.voice_stability is 'Voice stability parameter for ElevenLabs (0-1 range)';
comment on column agents.voice_similarity_boost is 'Voice similarity boost parameter for ElevenLabs (0-1 range)';
comment on column agents.voice_style is 'Voice style preset (e.g., customer_support, neutral)';
