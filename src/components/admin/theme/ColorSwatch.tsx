import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { ThemeSetting, hslToHex, hexToHsl } from '@/hooks/useThemeSettings';

interface ColorSwatchProps {
  setting: ThemeSetting;
  onUpdate: (id: string, lightValue: string, darkValue?: string | null) => void;
}

export function ColorSwatch({ setting, onUpdate }: ColorSwatchProps) {
  const [lightHex, setLightHex] = useState(hslToHex(setting.color_value_light));
  const [darkHex, setDarkHex] = useState(setting.color_value_dark ? hslToHex(setting.color_value_dark) : hslToHex(setting.color_value_light));
  const [isOpen, setIsOpen] = useState(false);

  const handleLightChange = (hex: string) => {
    setLightHex(hex);
  };

  const handleDarkChange = (hex: string) => {
    setDarkHex(hex);
  };

  const handleSave = () => {
    onUpdate(
      setting.id,
      hexToHsl(lightHex),
      hexToHsl(darkHex)
    );
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
          <div 
            className="w-12 h-12 rounded-lg border shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: `hsl(${setting.color_value_light})` }}
          />
          <span className="text-xs font-medium text-center leading-tight">
            {setting.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {hslToHex(setting.color_value_light)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="center">
        <div className="space-y-4">
          <div className="font-medium text-sm">{setting.label}</div>
          
          {/* Light Mode */}
          <div className="space-y-2">
            <Label className="text-xs">Light Mode</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lightHex}
                onChange={(e) => handleLightChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                value={lightHex}
                onChange={(e) => handleLightChange(e.target.value)}
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              HSL: {hexToHsl(lightHex)}
            </div>
          </div>

          {/* Dark Mode */}
          <div className="space-y-2">
            <Label className="text-xs">Dark Mode</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={darkHex}
                onChange={(e) => handleDarkChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                value={darkHex}
                onChange={(e) => handleDarkChange(e.target.value)}
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              HSL: {hexToHsl(darkHex)}
            </div>
          </div>

          {/* Preview */}
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded bg-white border">
              <div 
                className="w-full h-8 rounded"
                style={{ backgroundColor: lightHex }}
              />
              <span className="text-[10px] text-gray-600 mt-1 block text-center">Light</span>
            </div>
            <div className="flex-1 p-2 rounded bg-gray-900 border border-gray-700">
              <div 
                className="w-full h-8 rounded"
                style={{ backgroundColor: darkHex }}
              />
              <span className="text-[10px] text-gray-400 mt-1 block text-center">Dark</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave}>
              Speichern
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setLightHex(hslToHex(setting.color_value_light));
                setDarkHex(setting.color_value_dark ? hslToHex(setting.color_value_dark) : hslToHex(setting.color_value_light));
              }}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
