-- Certificate Engine V2 Migration
-- Evolves certificate_templates and certificates for theme-driven generation
-- Safe migration: old columns (title_coords_json, name_coords_json, date_coords_json) are kept but unused

-- 1. Extend certificate_templates with theme and content fields
ALTER TABLE public.certificate_templates
  ADD COLUMN IF NOT EXISTS theme_id varchar(50) DEFAULT 'modern-gold',
  ADD COLUMN IF NOT EXISTS cert_title text DEFAULT 'Certificate of Completion',
  ADD COLUMN IF NOT EXISTS cert_subtitle text DEFAULT 'PROUDLY PRESENTED TO',
  ADD COLUMN IF NOT EXISTS description text DEFAULT 'for participation in the campus event',
  ADD COLUMN IF NOT EXISTS signatory_left_name text DEFAULT 'Coordinator',
  ADD COLUMN IF NOT EXISTS signatory_left_title text DEFAULT 'Event Coordinator',
  ADD COLUMN IF NOT EXISTS signatory_right_name text DEFAULT 'Director',
  ADD COLUMN IF NOT EXISTS signatory_right_title text DEFAULT 'Campus Director',
  ADD COLUMN IF NOT EXISTS cert_number_format text DEFAULT 'CRA-2026-{{event_id}}-{{user_id}}',
  ADD COLUMN IF NOT EXISTS auto_generate boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_qr boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- 2. Extend certificates with verification data
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS certificate_number varchar(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS verification_url text;

-- 3. Index for fast verification lookups
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);

-- 4. Update template_url default for new templates (no longer required to be a URL)
-- Old templates keep their existing template_url values
