-- Migration: Add Event Fees and Payment Verification features

-- 1. Add columns to events table
ALTER TABLE events
ADD COLUMN is_paid BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN fee_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_qr_url TEXT,
ADD COLUMN payment_remarks TEXT;

-- 2. Add columns to registrations table
ALTER TABLE registrations
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'free' CHECK (payment_status IN ('free', 'pending_verification', 'verified', 'rejected')),
ADD COLUMN payment_screenshot_url TEXT,
ADD COLUMN transaction_id TEXT;
