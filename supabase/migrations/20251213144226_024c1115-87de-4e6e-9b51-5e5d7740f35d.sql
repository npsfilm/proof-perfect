-- Neue Spalte für Zeichnungsdaten (Fabric.js JSON)
ALTER TABLE photo_annotations 
ADD COLUMN drawing_data JSONB DEFAULT NULL;

-- Annotation-Typ zur Unterscheidung (marker = Punkt-Annotation, drawing = Zeichnung)
ALTER TABLE photo_annotations 
ADD COLUMN annotation_type TEXT DEFAULT 'marker' 
CHECK (annotation_type IN ('marker', 'drawing'));

-- x_position, y_position und comment nullable machen (für reine Zeichnungen nicht benötigt)
ALTER TABLE photo_annotations 
ALTER COLUMN x_position DROP NOT NULL,
ALTER COLUMN y_position DROP NOT NULL,
ALTER COLUMN comment DROP NOT NULL;