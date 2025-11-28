import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  show: boolean;
  onToggle: () => void;
}

export function KeyboardShortcuts({ show, onToggle }: KeyboardShortcutsProps) {
  return (
    <>
      {/* Toggle Button - Desktop only */}
      <button
        onClick={onToggle}
        className="hidden lg:block absolute top-4 left-4 text-white/60 hover:text-white z-10"
        title="Tastaturkürzel anzeigen"
      >
        <Keyboard className="h-6 w-6" />
      </button>

      {/* Shortcuts Overlay */}
      {show && (
        <div className="absolute top-16 left-4 bg-black/80 text-white rounded-lg p-4 z-10 backdrop-blur-sm">
          <h3 className="font-medium mb-3 text-sm">Tastaturkürzel</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
              <span>Vorheriges Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
              <span>Nächstes Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">Leertaste</kbd>
              <span>Foto auswählen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd>
              <span>Schließen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">?</kbd>
              <span>Diese Hilfe ein/ausblenden</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">Strg + Scroll</kbd>
              <span>Zoomen</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
