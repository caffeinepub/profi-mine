import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface DynamicArrayInputProps {
  values: number[];
  onChange: (values: number[]) => void;
  label: string;
  unit: string;
  step?: number;
}

export default function DynamicArrayInput({ values, onChange, label, unit, step = 1 }: DynamicArrayInputProps) {
  const addYear = () => {
    onChange([...values, values[values.length - 1] || 0]);
  };

  const removeYear = () => {
    if (values.length > 1) {
      onChange(values.slice(0, -1));
    }
  };

  const updateValue = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {values.length} years configured
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={removeYear}
            disabled={values.length <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addYear}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {values.map((value, index) => (
          <div key={index} className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {label} {index + 1}
            </label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step={step}
                value={value}
                onChange={(e) => updateValue(index, parseFloat(e.target.value) || 0)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
