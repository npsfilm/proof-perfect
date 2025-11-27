-- Make the proofs bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'proofs';