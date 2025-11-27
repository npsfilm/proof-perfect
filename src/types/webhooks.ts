import { SalutationType } from './database';

export interface EventBase {
  event_id: string;
  timestamp: string;
  actor_user_id?: string;
  salutation: SalutationType;
}

export interface SendToClientPayload extends EventBase {
  client_emails: string[];
  new_passwords: string[];
  gallery_url: string;
}

export interface DeliveryPayload extends EventBase {
  client_emails: string[];
  download_link: string;
}

export interface ReviewSubmittedPayload extends EventBase {
  gallery_name: string;
  selected_count: number;
  staging_count: number;
  admin_email: string;
}

export interface WebhookLog {
  id: string;
  gallery_id?: string;
  type: 'send' | 'deliver' | 'review';
  status: 'pending' | 'success' | 'error';
  response_body?: any;
  created_at: string;
}
