export type CompanyRoleType = 'owner' | 'company_admin' | 'employee';

export interface CompanyMemberExtended {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRoleType;
  can_view_invoices: boolean;
  can_view_prices: boolean;
  can_manage_team: boolean;
  invited_by: string | null;
  invited_at: string | null;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
  };
}

export interface CompanyBilling {
  id: string;
  company_id: string;
  billing_name: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  vat_id: string | null;
  tax_number: string | null;
  billing_email: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  payment_terms_days: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  amount_cents: number;
  tax_amount_cents: number;
  status: InvoiceStatus;
  pdf_url: string | null;
  description: string | null;
  uploaded_by: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  company_id: string;
  email: string;
  role: CompanyRoleType;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export const COMPANY_ROLE_LABELS: Record<CompanyRoleType, string> = {
  owner: 'Geschäftsführer',
  company_admin: 'Administrator',
  employee: 'Mitarbeiter',
};
