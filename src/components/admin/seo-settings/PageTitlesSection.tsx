import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, FileText, Home, Image, Settings, LayoutDashboard, Images } from 'lucide-react';
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
  const resolvePlaceholders = (template: string | null) => {
    if (!template) return '';
    return template
      .replace('{suffix}', settings.meta_title_suffix || '')
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
            title={resolvePlaceholders(settings.default_page_title)} 
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
            value={settings.default_page_title || ''}
            placeholder="ImmoOnPoint - Professionelle Immobilienfotografie"
            onChange={(value) => onUpdate({ default_page_title: value })}
          />
          <TitleField
            label="Titel-Suffix"
            icon={<FileText className="h-4 w-4" />}
            value={settings.meta_title_suffix || ''}
            placeholder=" | ImmoOnPoint"
            onChange={(value) => onUpdate({ meta_title_suffix: value })}
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
            value={settings.page_title_dashboard || ''}
            placeholder="Meine Galerien{suffix}"
            onChange={(value) => onUpdate({ page_title_dashboard: value })}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Galerie-Ansicht"
            icon={<Images className="h-4 w-4" />}
            value={settings.page_title_gallery || ''}
            placeholder="{gallery_name}{suffix}"
            onChange={(value) => onUpdate({ page_title_gallery: value })}
            placeholders={['{gallery_name}', '{suffix}']}
          />
          <TitleField
            label="Virtuelle Bearbeitung"
            icon={<Image className="h-4 w-4" />}
            value={settings.page_title_virtual_editing || ''}
            placeholder="Virtuelle Bearbeitung{suffix}"
            onChange={(value) => onUpdate({ page_title_virtual_editing: value })}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Staging anfordern"
            icon={<Image className="h-4 w-4" />}
            value={settings.page_title_staging || ''}
            placeholder="Staging anfordern{suffix}"
            onChange={(value) => onUpdate({ page_title_staging: value })}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Einstellungen"
            icon={<Settings className="h-4 w-4" />}
            value={settings.page_title_settings || ''}
            placeholder="Einstellungen{suffix}"
            onChange={(value) => onUpdate({ page_title_settings: value })}
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
            value={settings.page_title_admin_dashboard || ''}
            placeholder="Admin Dashboard{suffix}"
            onChange={(value) => onUpdate({ page_title_admin_dashboard: value })}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Galerien verwalten"
            icon={<Images className="h-4 w-4" />}
            value={settings.page_title_admin_galleries || ''}
            placeholder="Galerien verwalten{suffix}"
            onChange={(value) => onUpdate({ page_title_admin_galleries: value })}
            placeholders={['{suffix}']}
          />
          <TitleField
            label="Admin Einstellungen"
            icon={<Settings className="h-4 w-4" />}
            value={settings.page_title_admin_settings || ''}
            placeholder="Admin Einstellungen{suffix}"
            onChange={(value) => onUpdate({ page_title_admin_settings: value })}
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
