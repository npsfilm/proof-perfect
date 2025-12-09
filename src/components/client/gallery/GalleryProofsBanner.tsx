import { Info } from 'lucide-react';

export function GalleryProofsBanner() {
  return (
    <div className="bg-blue-50 border-b border-blue-200 py-3">
      <div className="container mx-auto px-4">
        <p className="text-sm text-blue-900 text-center">
          <Info className="inline h-4 w-4 mr-1" />
          <strong>Nur unbearbeitete Proofs.</strong> Farben und Beleuchtung werden in der finalen Version korrigiert. Bitte konzentrieren Sie sich auf Winkel und Komposition.
        </p>
      </div>
    </div>
  );
}
