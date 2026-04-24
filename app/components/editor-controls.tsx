import type { Primitive } from '@src/types';
import { Input } from '@/components/ui/input';

type PrimitiveValueInputProps = {
  value: Primitive;
  onChange: (value: Primitive) => void;
  placeholder?: string;
};

export function PrimitiveValueInput({
  value,
  onChange,
  placeholder,
}: PrimitiveValueInputProps) {
  return (
    <Input
      value={value === null ? '' : String(value)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export function getUniqueKey(source: Record<string, unknown>, baseName: string): string {
  let suffix = 1;
  let candidate = baseName;

  while (Object.prototype.hasOwnProperty.call(source, candidate)) {
    candidate = `${baseName}${suffix}`;
    suffix += 1;
  }

  return candidate;
}
