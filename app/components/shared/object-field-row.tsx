import type { Primitive } from '@src/types';
import { RiDeleteBinLine } from '@remixicon/react';
import { PrimitiveValueInput } from '@/components/editor-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ObjectFieldRowProps = {
  fieldKey: string;
  value: Primitive;
  onKeyChange: (nextKey: string) => void;
  onValueChange: (nextValue: Primitive) => void;
  onRemove: () => void;
};

export function ObjectFieldRow({
  fieldKey,
  value,
  onKeyChange,
  onValueChange,
  onRemove,
}: ObjectFieldRowProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
      <Button
        variant="destructive"
        size="icon-sm"
        className="self-center"
        onClick={onRemove}
        aria-label={`Remove ${fieldKey}`}
      >
        <RiDeleteBinLine />
      </Button>
      <Input
        value={fieldKey}
        onChange={(event) => onKeyChange(event.target.value)}
        placeholder="Field name"
      />
      <div className="col-span-2 md:col-auto">
        <PrimitiveValueInput value={value} onChange={onValueChange} placeholder="Value" />
      </div>
    </div>
  );
}
