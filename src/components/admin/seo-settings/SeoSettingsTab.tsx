import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useSeoSettings } from '@/hooks/useSeoSettings';
import { BrandingSection } from './BrandingSection';
import { MetaTagsSection } from './MetaTagsSection';
import { SocialMediaSection } from './SocialMediaSection';
import { StructuredDataSection } from './StructuredDataSection';
import { AnalyticsSection } from './AnalyticsSection';
import { DynamicContentSection } from './DynamicContentSection';
import { PageTitlesSection } from './PageTitlesSection';
import { Skeleton } from '@/components/ui/skeleton';
import type { SeoSettingsUpdate } from './types';

export function SeoSettingsTab() {
  const { settings, isLoading, updateSettings, uploadImage } = useSeoSettings();

  const handleUpdate = (updates: SeoSettingsUpdate) => {
    updateSettings.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine SEO-Einstellungen gefunden. Bitte laden Sie die Seite neu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="titles">Seitentitel</TabsTrigger>
          <TabsTrigger value="meta">Meta-Tags</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Inhalte</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="branding">
            <BrandingSection
              settings={settings}
              onUpdate={handleUpdate}
              onUploadImage={uploadImage}
            />
          </TabsContent>

          <TabsContent value="titles">
            <PageTitlesSection
              settings={settings}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="meta">
            <MetaTagsSection
              settings={settings}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaSection
              settings={settings}
              onUpdate={handleUpdate}
              onUploadImage={uploadImage}
            />
          </TabsContent>

          <TabsContent value="schema">
            <StructuredDataSection
              settings={settings}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection
              settings={settings}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="content">
            <DynamicContentSection
              settings={settings}
              onUpdate={handleUpdate}
              onUploadImage={uploadImage}
            />
          </TabsContent>
        </div>
      </Tabs>

      {updateSettings.isPending && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Speichern...
        </div>
      )}
    </div>
  );
}
