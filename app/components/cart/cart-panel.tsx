import type { Cart } from '@src/types';
import { CartEditor } from '@/components/cart/cart-editor';
import { getUniqueKey } from '@/components/editor-controls';
import { EditorPanel } from '@/components/shared/editor-panel';

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
      editor={<CartEditor value={value} onChange={onChange} onAddField={handleAddField} />}
      className="h-full"
      contentClassName="space-y-6"
    />
  );
}
