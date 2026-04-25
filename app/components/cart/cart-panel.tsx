import { CartEditor } from '@/components/cart/cart-editor';
import { getUniqueKey } from '@/components/editor-controls';
import { EditorPanel } from '@/components/shared/editor-panel';
import { Button } from '@/components/ui/button';
import { loadDefaultCart } from '@/fixtures';

import type { Cart } from '@src/types';

type CartPanelProps = {
  value: Cart;
  onChange: (value: Cart) => void;
};

export function CartPanel({ value, onChange }: CartPanelProps) {
  function handleAddField() {
    const nextKey = getUniqueKey(value, 'field');
    onChange({
      ...value,
      [nextKey]: '',
    });
  }

  return (
    <EditorPanel
      title="Cart"
      value={value}
      onChange={onChange}
      editor={<CartEditor value={value} onChange={onChange} />}
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onChange(loadDefaultCart())}>
            Reset cart
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddField}>
            Add field
          </Button>
        </div>
      }
      className="h-full"
      contentClassName="space-y-6"
    />
  );
}
