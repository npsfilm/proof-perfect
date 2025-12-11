import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, FileText, Home, Image, Settings, LayoutDashboard, Images } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface PageTitlesSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

interface TitleFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  placeholders?: string[];
}

function TitleField({ label, icon, value, placeholder, onChange, placeholders }: TitleFieldProps) {
  const charCount = value?.length || 0;
  const isOptimal = charCount > 0 && charCount <= 60;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </Label>
        <span className={`text-xs ${isOptimal ? 'text-muted-foreground' : charCount > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/60
        </span>
      </div>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono text-sm"
      />
      {placeholders && placeholders.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {placeholders.map((p) => (
            <Badge key={p} variant="outline" className="text-xs font-mono">
              {p}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function BrowserTabPreview({ title, favicon }: { title: string; favicon?: string | null }) {
  return (
    <div className="bg-muted rounded-t-lg p-2 border border-b-0">
      <div className="flex items-center gap-2 bg-background rounded px-3 py-1.5 max-w-xs">
        {favicon ? (
          <img src={favicon} alt="" className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-xs truncate">{title || 'Seitentitel'}</span>
        <span className="text-muted-foreground ml-auto">×</span>
      </div>
    </div>
  );
}

export function PageTitlesSection({ settings, onUpdate }: PageTitlesSectionProps) {
  // Local state for all title fields
  const [localDefaultTitle, setLocalDefaultTitle] = useState(settings.default_page_title || '');
  const [localTitleSuffix, setLocalTitleSuffix] = useState(settings.meta_title_suffix || '');
  const [localDashboard, setLocalDashboard] = useState(settings.page_title_dashboard || '');
  const [localGallery, setLocalGallery] = useState(settings.page_title_gallery || '');
  const [localVirtualEditing, setLocalVirtualEditing] = useState(settings.page_title_virtual_editing || '');
  const [localStaging, setLocalStaging] = useState(settings.page_title_staging || '');
  const [localSettings, setLocalSettings] = useState(settings.page_title_settings || '');
  const [localAdminDashboard, setLocalAdminDashboard] = useState(settings.page_title_admin_dashboard || '');
  const [localAdminGalleries, setLocalAdminGalleries] = useState(settings.page_title_admin_galleries || '');
  const [localAdminSettings, setLocalAdminSettings] = useState(settings.page_title_admin_settings || '');

  // Debounced values
  const debouncedDefaultTitle = useDebounce(localDefaultTitle, 500);
  const debouncedTitleSuffix = useDebounce(localTitleSuffix, 500);
  const debouncedDashboard = useDebounce(localDashboard, 500);
  const debouncedGallery = useDebounce(localGallery, 500);
  const debouncedVirtualEditing = useDebounce(localVirtualEditing, 500);
  const debouncedStaging = useDebounce(localStaging, 500);
  const debouncedSettings = useDebounce(localSettings, 500);
  const debouncedAdminDashboard = useDebounce(localAdminDashboard, 500);
  const debouncedAdminGalleries = useDebounce(localAdminGalleries, 500);
  const debouncedAdminSettings = useDebounce(localAdminSettings, 500);

  // Sync local state when settings change from outside
  useEffect(() => { setLocalDefaultTitle(settings.default_page_title || ''); }, [settings.default_page_title]);
  useEffect(() => { setLocalTitleSuffix(settings.meta_title_suffix || ''); }, [settings.meta_title_suffix]);
  useEffect(() => { setLocalDashboard(settings.page_title_dashboard || ''); }, [settings.page_title_dashboard]);
  useEffect(() => { setLocalGallery(settings.page_title_gallery || ''); }, [settings.page_title_gallery]);
  useEffect(() => { setLocalVirtualEditing(settings.page_title_virtual_editing || ''); }, [settings.page_title_virtual_editing]);
  useEffect(() => { setLocalStaging(settings.page_title_staging || ''); }, [settings.page_title_staging]);
  useEffect(() => { setLocalSettings(settings.page_title_settings || ''); }, [settings.page_title_settings]);
  useEffect(() => { setLocalAdminDashboard(settings.page_title_admin_dashboard || ''); }, [settings.page_title_admin_dashboard]);
  useEffect(() => { setLocalAdminGalleries(settings.page_title_admin_galleries || ''); }, [settings.page_title_admin_galleries]);
  useEffect(() => { setLocalAdminSettings(settings.page_title_admin_settings || ''); }, [settings.page_title_admin_settings]);

  // Save debounced values
  useEffect(() => {
    if (debouncedDefaultTitle !== (settings.default_page_title || '')) {
      onUpdate({ default_page_title: debouncedDefaultTitle });
    }
  }, [debouncedDefaultTitle]);

  useEffect(() => {
    if (debouncedTitleSuffix !== (settings.meta_title_suffix || '')) {
      onUpdate({ meta_title_suffix: debouncedTitleSuffix });
    }
  }, [debouncedTitleSuffix]);

  useEffect(() => {
    if (debouncedDashboard !== (settings.page_title_dashboard || '')) {
      onUpdate({ page_title_dashboard: debouncedDashboard });
    }
  }, [debouncedDashboard]);

  useEffect(() => {
    if (debouncedGallery !== (settings.page_title_gallery || '')) {
      onUpdate({ page_title_gallery: debouncedGallery });
    }
  }, [debouncedGallery]);

  useEffect(() => {
    if (debouncedVirtualEditing !== (settings.page_title_virtual_editing || '')) {
      onUpdate({ page_title_virtual_editing: debouncedVirtualEditing });
    }
  }, [debouncedVirtualEditing]);

  useEffect(() => {
    if (debouncedStaging !== (settings.page_title_staging || '')) {
      onUpdate({ page_title_staging: debouncedStaging });
    }
  }, [debouncedStaging]);

  useEffect(() => {
    if (debouncedSettings !== (settings.page_title_settings || '')) {
      onUpdate({ page_title_settings: debouncedSettings });
    }
  }, [debouncedSettings]);

  useEffect(() => {
    if (debouncedAdminDashboard !== (settings.page_title_admin_dashboard || '')) {
      onUpdate({ page_title_admin_dashboard: debouncedAdminDashboard });
    }
  }, [debouncedAdminDashboard]);

  useEffect(() => {
    if (debouncedAdminGalleries !== (settings.page_title_admin_galleries || '')) {
      onUpdate({ page_title_admin_galleries: debouncedAdminGalleries });
    }
  }, [debouncedAdminGalleries]);

  useEffect(() => {
    if (debouncedAdminSettings !== (settings.page_title_admin_settings || '')) {
      onUpdate({ page_title_admin_settings: debouncedAdminSettings });
    }
  }, [debouncedAdminSettings]);

  const resolvePlaceholders = (template: string | null) => {
    if (!template) return '';
    return template
      .replace('{suffix}', localTitleSuffix || '')
      .replace('{gallery_name}', 'Musterstraße 123');
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Browser-Tab Vorschau</CardTitle>
          <CardDescription>So erscheint der Titel im Browser-Tab</CardDescription>
        </CardHeader>
        <CardContent>
          <BrowserTabPreview 
            title={resolvePlaceholders(localDefaultTitle)} 
            favicon={settings.favicon_url}
          />
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Allgemeine Einstellungen</CardTitle>
          <CardDescription>Standard-Titel und Suffix für alle Seiten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TitleField
            label="Standard-Seitentitel (Startseite)"
            icon={<Home className="h-4 w-4" />}
            value={localDefaultTitle}
            placeholder="ImmoOnPoint - Professionelle Immobilienfotografie"
            onChange={setLocalDefaultTitle}
          />
          <TitleField
            label="Titel-Suffix"
            icon={<FileText className="h-4 w-4" />}
            value={localTitleSuffix}
            placeholder=" | ImmoOnPoint"
            onChange={setLocalTitleSuffix}
          />
        </CardContent>
      </Card>

      {/* Client Pages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kundenbereich</CardTitle>
          <CardDescription>Seitentitel für den Kundenbereich</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TitleField
            label="Dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            value={localDashboard}
            placeholder="Meine Galerien{suffix}"
            onChange={setLocalDashboard}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Galerie-Ansicht"
            icon={<Images className="h-4 w-4" />}
            value={localGallery}
            placeholder="{gallery_name}{suffix}"
            onChange={setLocalGallery}
            placeholders={['{gallery_name}', '{suffix}']}
          />
          <TitleField
            label="Virtuelle Bearbeitung"
            icon={<Image className="h-4 w-4" />}
            value={localVirtualEditing}
            placeholder="Virtuelle Bearbeitung{suffix}"
            onChange={setLocalVirtualEditing}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Staging anfordern"
            icon={<Image className="h-4 w-4" />}
            value={localStaging}
            placeholder="Staging anfordern{suffix}"
            onChange={setLocalStaging}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Einstellungen"
            icon={<Settings className="h-4 w-4" />}
            value={localSettings}
            placeholder="Einstellungen{suffix}"
            onChange={setLocalSettings}
            placeholders={['{suffix}']}
          />
        </CardContent>
      </Card>

      {/* Admin Pages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Admin-Bereich</CardTitle>
          <CardDescription>Seitentitel für den Administrationsbereich</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TitleField
            label="Admin Dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            value={localAdminDashboard}
            placeholder="Admin Dashboard{suffix}"
            onChange={setLocalAdminDashboard}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Galerien verwalten"
            icon={<Images className="h-4 w-4" />}
            value={localAdminGalleries}
            placeholder="Galerien verwalten{suffix}"
            onChange={setLocalAdminGalleries}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Admin Einstellungen"
            icon={<Settings className="h-4 w-4" />}
            value={localAdminSettings}
            placeholder="Admin Einstellungen{suffix}"
            onChange={setLocalAdminSettings}
            placeholders={['{suffix}']}
          />
        </CardContent>
      </Card>

      {/* Placeholder Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platzhalter-Referenz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{'{suffix}'}</Badge>
              <span className="text-muted-foreground">→ Wird ersetzt durch den Titel-Suffix</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{'{gallery_name}'}</Badge>
              <span className="text-muted-foreground">→ Name der aktuellen Galerie</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
