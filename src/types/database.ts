export type RoleType = 'admin' | 'client';
export type GalleryStatus = 'Draft' | 'Sent' | 'Reviewed' | 'Delivered';
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
