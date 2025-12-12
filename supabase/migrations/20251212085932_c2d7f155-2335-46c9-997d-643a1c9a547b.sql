-- Add legal and email reason columns to email_design_settings
ALTER TABLE public.email_design_settings 
ADD COLUMN IF NOT EXISTS legal_company_name TEXT DEFAULT 'NPS Media GmbH',
ADD COLUMN IF NOT EXISTS legal_register_info TEXT DEFAULT 'HRB 38388 Amtsgericht Augsburg',
ADD COLUMN IF NOT EXISTS legal_vat_id TEXT DEFAULT 'DE359733225',
ADD COLUMN IF NOT EXISTS include_confidentiality_notice BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS confidentiality_notice TEXT DEFAULT 'Diese E-Mail enthält vertrauliche und/oder rechtlich geschützte Informationen. Wenn Sie nicht der richtige Adressat sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und vernichten Sie diese E-Mail. Das unerlaubte Kopieren sowie die unbefugte Weitergabe dieser E-Mail ist nicht gestattet. Bitte behalten Sie für die schnellere Bearbeitung den Verlauf der E-Mail bei.',
ADD COLUMN IF NOT EXISTS reason_transactional TEXT DEFAULT 'Sie erhalten diese E-Mail, weil Sie eine Bestellung über ImmoOnPoint aufgegeben haben.',
ADD COLUMN IF NOT EXISTS reason_newsletter TEXT DEFAULT 'Sie erhalten diese E-Mail, weil Sie in der Vergangenheit eine Marketingdienstleistung von ImmoOnPoint in Anspruch genommen oder sich für den Newsletter angemeldet haben.';

-- Update existing record with default values and address
UPDATE public.email_design_settings SET
  physical_address_line1 = COALESCE(physical_address_line1, 'Klinkerberg 9'),
  physical_address_line2 = COALESCE(physical_address_line2, '86152 Augsburg'),
  physical_address_country = COALESCE(physical_address_country, 'Deutschland'),
  reply_to_email = COALESCE(reply_to_email, 'info@immoonpoint.de'),
  legal_company_name = COALESCE(legal_company_name, 'NPS Media GmbH'),
  legal_register_info = COALESCE(legal_register_info, 'HRB 38388 Amtsgericht Augsburg'),
  legal_vat_id = COALESCE(legal_vat_id, 'DE359733225')
WHERE id IS NOT NULL;