import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ClientEmailInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  disabled?: boolean;
}

export function ClientEmailInput({ emails, onChange, disabled }: ClientEmailInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  };

  const addEmail = () => {
    const email = inputValue.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)) {
      onChange([...emails, email]);
      setInputValue('');
    }
  };

  const removeEmail = (index: number) => {
    onChange(emails.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="client-emails">Client Emails</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px]">
        {emails.map((email, index) => (
          <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
            {email}
            <button
              type="button"
              onClick={() => removeEmail(index)}
              disabled={disabled}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          id="client-emails"
          type="email"
          placeholder={emails.length === 0 ? 'Enter email and press Enter' : 'Add another...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addEmail}
          disabled={disabled}
          className="flex-1 min-w-[200px] border-0 p-0 h-8 focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add multiple emails
      </p>
    </div>
  );
}
