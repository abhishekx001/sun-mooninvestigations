-- Run this in the Supabase SQL Editor

-- Add document_urls array to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS document_urls TEXT[] DEFAULT '{}';

