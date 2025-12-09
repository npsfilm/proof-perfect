import { Gallery, Photo, StagingReference } from '@/types/database';

export interface GalleryReviewData {
  gallery: Gallery;
  selectedPhotos: Photo[];
  feedback: any[];
  clientEmails: string[];
  allAnnotations: any[];
  stagingReferences: StagingReference[];
  deliveryFiles: any[];
}

export interface PhotoWithAnnotations extends Photo {
  annotations?: any[];
}

export interface ServiceCounts {
  stagingPhotos: Photo[];
  blueHourPhotos: Photo[];
  photosWithComments: Photo[];
  photosWithAnnotations: number;
  hasServices: boolean;
}
