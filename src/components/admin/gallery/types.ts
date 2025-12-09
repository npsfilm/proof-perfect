import { Gallery, Photo, Client } from '@/types/database';

export interface ReopenRequest {
  id: string;
  gallery_id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface GalleryDetailData {
  gallery: Gallery;
  photos: Photo[] | undefined;
  selectedClients: Client[];
  pendingRequests: ReopenRequest[];
  isDraft: boolean;
  isClosed: boolean;
}
