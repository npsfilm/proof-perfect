export type RoleType = 'admin' | 'client';
export type GalleryStatus = 'Planning' | 'Open' | 'Closed' | 'Processing' | 'Delivered';
export type SalutationType = 'Du' | 'Sie';

export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleType;
  created_at: string;
}

export interface Gallery {
  id: string;
  name: string;
  slug: string;
  status: GalleryStatus;
  package_target_count: number;
  salutation_type: SalutationType;
  company_id?: string;
  address?: string;
  final_delivery_link?: string;
  is_locked: boolean;
  reviewed_at?: string;
  reviewed_by?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryAccess {
  id: string;
  user_id: string;
  gallery_id: string;
  created_at: string;
}

export interface Photo {
  id: string;
  gallery_id: string;
  filename: string;
  storage_url: string;
  upload_order: number;
  is_selected: boolean;
  client_comment?: string;
  staging_requested: boolean;
  staging_style?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryFeedback {
  id: string;
  gallery_id: string;
  author_user_id: string;
  message: string;
  created_at: string;
}

export interface StagingReference {
  id: string;
  photo_id: string;
  uploader_user_id: string;
  file_url: string;
  notes?: string;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  gallery_id?: string;
  type: string;
  status: string;
  response_body?: any;
  created_at: string;
}

export interface SystemSettings {
  id: string;
  zapier_webhook_send?: string;
  zapier_webhook_deliver?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  created_at: string;
}

export interface Client {
  id: string;
  email: string;
  anrede?: 'Herr' | 'Frau' | 'Divers';
  vorname: string;
  nachname: string;
  ansprache: 'Du' | 'Sie';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryClient {
  id: string;
  gallery_id: string;
  client_id: string;
  created_at: string;
}

export interface PhotoAnnotation {
  id: string;
  photo_id: string;
  author_user_id: string;
  x_position: number; // 0-100 percentage
  y_position: number; // 0-100 percentage
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyGalleryStats {
  company_id: string;
  company_name: string;
  slug: string;
  domain?: string;
  galleries_count: number;
  photos_count: number;
  selected_count: number;
  staging_count: number;
  reviewed_count: number;
  delivered_count: number;
}

export interface UserActivity {
  user_id: string;
  email: string;
  role?: RoleType;
  last_sign_in_at?: string;
  galleries_assigned: number;
  selections_made: number;
}

export interface GallerySelectionStats {
  gallery_id: string;
  company_id?: string;
  name: string;
  slug: string;
  status: GalleryStatus;
  created_at: string;
  photos_count: number;
  selected_count: number;
  staging_count: number;
}
