-- Add express_delivery_requested to galleries table
ALTER TABLE galleries ADD COLUMN express_delivery_requested boolean NOT NULL DEFAULT false;

-- Add blue_hour_requested to photos table
ALTER TABLE photos ADD COLUMN blue_hour_requested boolean NOT NULL DEFAULT false;