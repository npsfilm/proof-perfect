import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AutoCondition {
  field?: string;
  operator?: string;
  value?: number;
}

interface AutoConditionEditorProps {
  value: AutoCondition;
  onChange: (value: AutoCondition) => void;
}

const FIELDS = [
  { value: 'booking_count', label: 'Anzahl Buchungen' },
  { value: 'total_revenue_cents', label: 'Gesamtumsatz (€)' },
  { value: 'days_since_last_booking', label: 'Tage seit letzter Buchung' },
  { value: 'staging_count', label: 'Anzahl Staging-Anfragen' },
  { value: 'blue_hour_count', label: 'Anzahl Blue Hour Bilder' },
];

const OPERATORS = [
  { value: 'eq', label: 'ist gleich (=)' },
  { value: 'gte', label: 'größer oder gleich (≥)' },
  { value: 'lte', label: 'kleiner oder gleich (≤)' },
  { value: 'gt', label: 'größer als (>)' },
  { value: 'lt', label: 'kleiner als (<)' },
];

export function AutoConditionEditor({ value, onChange }: AutoConditionEditorProps) {
  const handleFieldChange = (field: string) => {
    onChange({ ...value, field });
  };

  const handleOperatorChange = (operator: string) => {
    onChange({ ...value, operator });
  };

  const handleValueChange = (inputValue: string) => {
    let numValue = parseFloat(inputValue) || 0;
    
    // Convert euros to cents for revenue field
    if (value.field === 'total_revenue_cents') {
      numValue = numValue * 100;
    }
    
    onChange({ ...value, value: numValue });
  };

  // Get display value (convert cents to euros for revenue)
  const getDisplayValue = () => {
    if (!value.value) return '';
    if (value.field === 'total_revenue_cents') {
      return (value.value / 100).toString();
    }
    return value.value.toString();
  };

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm">Feld</Label>
        <Select value={value.field || ''} onValueChange={handleFieldChange}>
          <SelectTrigger>
            <SelectValue placeholder="Feld auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {FIELDS.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Operator</Label>
        <Select value={value.operator || ''} onValueChange={handleOperatorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Operator auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">
          Wert {value.field === 'total_revenue_cents' && '(in €)'}
        </Label>
        <Input
          type="number"
          value={getDisplayValue()}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="z.B. 10"
          min={0}
        />
      </div>

      {value.field && value.operator && value.value !== undefined && (
        <p className="text-xs text-muted-foreground mt-2">
          Vorschau: Kunden mit{' '}
          <strong>
            {FIELDS.find((f) => f.value === value.field)?.label}
          </strong>{' '}
          {OPERATORS.find((o) => o.value === value.operator)?.label}{' '}
          <strong>{getDisplayValue()}</strong>
          {value.field === 'total_revenue_cents' && ' €'}
        </p>
      )}
    </div>
  );
}
