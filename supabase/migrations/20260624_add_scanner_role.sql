-- Migration: Add 'scanner' value to the user_role enum type
ALTER TYPE public.user_role ADD VALUE 'scanner';
