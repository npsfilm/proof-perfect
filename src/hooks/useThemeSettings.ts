import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ThemeSetting {
  id: string;
  color_key: string;
  color_value_light: string;
  color_value_dark: string | null;
  category: string;
  label: string;
  sort_order: number;
}

export interface ThemeSettingsByCategory {
  brand: ThemeSetting[];
  status: ThemeSetting[];
  service: ThemeSetting[];
  slot: ThemeSetting[];
  accent: ThemeSetting[];
}

export function useThemeSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as ThemeSetting[];
    },
  });

  // Apply theme settings to CSS variables
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    settings.forEach((setting) => {
      const value = isDark && setting.color_value_dark 
        ? setting.color_value_dark 
        : setting.color_value_light;
      
      root.style.setProperty(`--${setting.color_key}`, value);
    });
  }, [settings]);

  // Group settings by category
  const settingsByCategory: ThemeSettingsByCategory = {
    brand: settings?.filter(s => s.category === 'brand') || [],
    status: settings?.filter(s => s.category === 'status') || [],
    service: settings?.filter(s => s.category === 'service') || [],
    slot: settings?.filter(s => s.category === 'slot') || [],
    accent: settings?.filter(s => s.category === 'accent') || [],
  };

  const updateColor = useMutation({
    mutationFn: async ({ 
      id, 
      color_value_light, 
      color_value_dark 
    }: { 
      id: string; 
      color_value_light: string; 
      color_value_dark?: string | null;
    }) => {
      const { error } = await supabase
        .from('theme_settings')
        .update({ 
          color_value_light,
          color_value_dark: color_value_dark ?? null,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      // Delete all and re-insert defaults
      const { error: deleteError } = await supabase
        .from('theme_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) throw deleteError;

      // Re-insert defaults (same as migration)
      const defaults = [
        { color_key: 'primary', color_value_light: '217 47% 32%', color_value_dark: '217 47% 45%', category: 'brand', label: 'Primärfarbe', sort_order: 1 },
        { color_key: 'secondary', color_value_light: '142 71% 45%', color_value_dark: '142 71% 35%', category: 'brand', label: 'Sekundärfarbe', sort_order: 2 },
        { color_key: 'accent', color_value_light: '240 4.8% 95.9%', color_value_dark: '240 3.7% 15.9%', category: 'brand', label: 'Akzent', sort_order: 3 },
        { color_key: 'destructive', color_value_light: '0 84.2% 60.2%', color_value_dark: '0 62.8% 30.6%', category: 'brand', label: 'Fehler/Löschen', sort_order: 4 },
        { color_key: 'status-planning-bg', color_value_light: '240 5% 96%', color_value_dark: '240 5% 20%', category: 'status', label: 'Planung (Hintergrund)', sort_order: 10 },
        { color_key: 'status-planning-text', color_value_light: '240 5% 26%', color_value_dark: '240 5% 80%', category: 'status', label: 'Planung (Text)', sort_order: 11 },
        { color_key: 'status-open-bg', color_value_light: '214 95% 93%', color_value_dark: '214 50% 20%', category: 'status', label: 'Offen (Hintergrund)', sort_order: 12 },
        { color_key: 'status-open-text', color_value_light: '214 100% 30%', color_value_dark: '214 100% 70%', category: 'status', label: 'Offen (Text)', sort_order: 13 },
        { color_key: 'status-closed-bg', color_value_light: '48 96% 89%', color_value_dark: '48 50% 20%', category: 'status', label: 'Geschlossen (Hintergrund)', sort_order: 14 },
        { color_key: 'status-closed-text', color_value_light: '48 100% 29%', color_value_dark: '48 100% 70%', category: 'status', label: 'Geschlossen (Text)', sort_order: 15 },
        { color_key: 'status-processing-bg', color_value_light: '27 96% 91%', color_value_dark: '27 50% 20%', category: 'status', label: 'In Bearbeitung (Hintergrund)', sort_order: 16 },
        { color_key: 'status-processing-text', color_value_light: '27 100% 30%', color_value_dark: '27 100% 70%', category: 'status', label: 'In Bearbeitung (Text)', sort_order: 17 },
        { color_key: 'status-delivered-bg', color_value_light: '142 76% 91%', color_value_dark: '142 40% 20%', category: 'status', label: 'Geliefert (Hintergrund)', sort_order: 18 },
        { color_key: 'status-delivered-text', color_value_light: '142 100% 25%', color_value_dark: '142 100% 70%', category: 'status', label: 'Geliefert (Text)', sort_order: 19 },
        { color_key: 'service-express', color_value_light: '0 84% 60%', color_value_dark: '0 84% 50%', category: 'service', label: 'Express-Lieferung', sort_order: 20 },
        { color_key: 'service-staging', color_value_light: '271 76% 53%', color_value_dark: '271 76% 60%', category: 'service', label: 'Virtuelles Staging', sort_order: 21 },
        { color_key: 'service-bluehour-start', color_value_light: '217 91% 50%', color_value_dark: '217 91% 60%', category: 'service', label: 'Blaue Stunde (Start)', sort_order: 22 },
        { color_key: 'service-bluehour-end', color_value_light: '27 96% 55%', color_value_dark: '27 96% 60%', category: 'service', label: 'Blaue Stunde (Ende)', sort_order: 23 },
        { color_key: 'info', color_value_light: '214 100% 50%', color_value_dark: '214 100% 60%', category: 'accent', label: 'Info', sort_order: 30 },
        { color_key: 'warning', color_value_light: '45 93% 47%', color_value_dark: '45 93% 55%', category: 'accent', label: 'Warnung', sort_order: 31 },
        { color_key: 'success', color_value_light: '142 71% 45%', color_value_dark: '142 71% 50%', category: 'accent', label: 'Erfolg', sort_order: 32 },
        { color_key: 'slot-recommended', color_value_light: '45 93% 47%', color_value_dark: '45 93% 55%', category: 'slot', label: 'Empfohlen', sort_order: 40 },
        { color_key: 'slot-cheapest', color_value_light: '142 71% 45%', color_value_dark: '142 71% 50%', category: 'slot', label: 'Günstigste Anfahrt', sort_order: 41 },
        { color_key: 'slot-flexible', color_value_light: '217 91% 60%', color_value_dark: '217 91% 65%', category: 'slot', label: 'Flexibel', sort_order: 42 },
        { color_key: 'slot-weekend', color_value_light: '271 81% 56%', color_value_dark: '271 81% 60%', category: 'slot', label: 'Wochenende', sort_order: 43 },
      ];

      const { error: insertError } = await supabase
        .from('theme_settings')
        .insert(defaults);
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
    },
  });

  return {
    settings,
    settingsByCategory,
    isLoading,
    error,
    updateColor,
    resetToDefaults,
  };
}

// Helper to convert HSL string to hex
export function hslToHex(hslString: string): string {
  const parts = hslString.split(' ');
  if (parts.length !== 3) return '#000000';
  
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper to convert hex to HSL string
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
