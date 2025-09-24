-- Migration: Update deliveries table to match application data structure
-- Date: September 25, 2025
-- Purpose: Add location fields and restructure time handling for delivery workflow

-- Add new columns for location data
ALTER TABLE hackathon.deliveries 
ADD COLUMN IF NOT EXISTS pickup_location text,
ADD COLUMN IF NOT EXISTS pickup_coordinates jsonb,
ADD COLUMN IF NOT EXISTS delivery_location text,
ADD COLUMN IF NOT EXISTS delivery_coordinates jsonb,
ADD COLUMN IF NOT EXISTS scheduled_pickup text,
ADD COLUMN IF NOT EXISTS scheduled_delivery text,
ADD COLUMN IF NOT EXISTS special_instructions text;

-- Rename existing columns for consistency
ALTER TABLE hackathon.deliveries 
RENAME COLUMN pickup_scheduled_at TO legacy_pickup_scheduled_at;
ALTER TABLE hackathon.deliveries 
RENAME COLUMN delivery_scheduled_at TO legacy_delivery_scheduled_at;
ALTER TABLE hackathon.deliveries 
RENAME COLUMN pickup_actual_at TO actual_pickup;
ALTER TABLE hackathon.deliveries 
RENAME COLUMN delivery_actual_at TO actual_delivery;
ALTER TABLE hackathon.deliveries 
RENAME COLUMN pickup_notes TO legacy_pickup_notes;
ALTER TABLE hackathon.deliveries 
RENAME COLUMN delivery_notes TO legacy_delivery_notes;

-- Add comment explaining the schema update
COMMENT ON TABLE hackathon.deliveries IS 
'Updated delivery table to support location coordinates and flexible time scheduling for AI-powered donation matching system';

-- Add indexes for new location columns
CREATE INDEX IF NOT EXISTS idx_deliveries_pickup_coordinates 
ON hackathon.deliveries USING gin (pickup_coordinates) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_coordinates 
ON hackathon.deliveries USING gin (delivery_coordinates) TABLESPACE pg_default;

-- Add index for special instructions (for searching)
CREATE INDEX IF NOT EXISTS idx_deliveries_special_instructions 
ON hackathon.deliveries USING gin (to_tsvector('english', special_instructions)) TABLESPACE pg_default;