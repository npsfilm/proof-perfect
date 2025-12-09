import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReviewDeliveryMethodCardProps {
  useExternalLink: boolean;
  setUseExternalLink: (value: boolean) => void;
  externalLink: string;
  setExternalLink: (value: string) => void;
}

export function ReviewDeliveryMethodCard({
  useExternalLink,
  setUseExternalLink,
  externalLink,
  setExternalLink,
}: ReviewDeliveryMethodCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Download-Methode</CardTitle>
        <CardDescription>Wählen Sie, wie Kunden ihre Fotos herunterladen sollen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="delivery-method"
              checked={!useExternalLink}
              onChange={() => setUseExternalLink(false)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">In-App Downloads (empfohlen)</div>
              <p className="text-sm text-muted-foreground">
                Kunden laden direkt von der Website herunter
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="delivery-method"
              checked={useExternalLink}
              onChange={() => setUseExternalLink(true)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">Externen Link verwenden</div>
              <p className="text-sm text-muted-foreground mb-2">
                Weiterleitung zu TransferNow, Google Drive, etc.
              </p>
              {useExternalLink && (
                <input
                  type="url"
                  placeholder="https://www.transfernow.net/dl/..."
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background shadow-neu-pressed focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
