import { RiDeleteBinLine } from '@remixicon/react';

import { getUniqueKey } from '@/components/editor-controls';
import { ObjectFieldRow } from '@/components/shared/object-field-row';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Cart, JsonObject, Primitive } from '@src/types';

type CartEditorProps = {
  value: Cart;
  onChange: (value: Cart) => void;
  onAddField: () => void;
};

function topLevelFields(cart: Cart): JsonObject {
  return Object.fromEntries(Object.entries(cart).filter(([key]) => key !== 'products'));
}

function withTopLevelFields(cart: Cart, fields: JsonObject): Cart {
  const nextCart: Cart = { ...fields };

  if (Array.isArray(cart.products)) {
    nextCart.products = cart.products;
  }

  return nextCart;
}

function renameObjectEntry<T extends JsonObject>(
  source: T,
  currentKey: string,
  nextKey: string,
  nextValue: Primitive,
): T {
  const renamed = Object.entries(source).reduce<JsonObject>((result, [key, value]) => {
    if (key === currentKey) {
      result[nextKey] = nextValue;
      return result;
    }

    result[key] = value;
    return result;
  }, {});

  return renamed as T;
}

function removeObjectEntry<T extends JsonObject>(source: T, targetKey: string): T {
  return Object.fromEntries(Object.entries(source).filter(([key]) => key !== targetKey)) as T;
}

function addPrimitiveField<T extends JsonObject>(source: T, baseName: string): T {
  return {
    ...source,
    [getUniqueKey(source, baseName)]: '',
  } as T;
}

function ProductEditor({
  product,
  index,
  onChange,
  onRemove,
}: {
  product: JsonObject;
  index: number;
  onChange: (value: JsonObject) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Product {index + 1}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(addPrimitiveField(product, 'field'))}
          >
            Add product field
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            <RiDeleteBinLine />
            <span className="sr-only">Remove product</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 md:space-y-3">
        {Object.entries(product).map(([key, rawValue], fieldIndex) => (
          <ObjectFieldRow
            key={`${index}-${fieldIndex}`}
            fieldKey={key}
            value={(rawValue ?? '') as Primitive}
            onKeyChange={(nextKey) =>
              onChange(renameObjectEntry(product, key, nextKey, (rawValue ?? '') as Primitive))
            }
            onValueChange={(nextValue) => onChange(renameObjectEntry(product, key, key, nextValue))}
            onRemove={() => onChange(removeObjectEntry(product, key))}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function CartEditor({ value, onChange, onAddField }: CartEditorProps) {
  const fields = topLevelFields(value);
  const products = value.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onAddField}>
          Add field
        </Button>
      </div>
      <div className="space-y-5 md:space-y-3">
        {Object.entries(fields).map(([key, rawValue], fieldIndex) => (
          <ObjectFieldRow
            key={fieldIndex}
            fieldKey={key}
            value={(rawValue ?? '') as Primitive}
            onKeyChange={(nextKey) =>
              onChange(
                withTopLevelFields(
                  value,
                  renameObjectEntry(fields, key, nextKey, (rawValue ?? '') as Primitive),
                ),
              )
            }
            onValueChange={(nextValue) =>
              onChange(withTopLevelFields(value, renameObjectEntry(fields, key, key, nextValue)))
            }
            onRemove={() => onChange(withTopLevelFields(value, removeObjectEntry(fields, key)))}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Products</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                products: [...products, { productId: '', quantity: 0 }],
              })
            }
          >
            Add product
          </Button>
        </div>

        <div className="space-y-4">
          {products.map((product, index) => (
            <ProductEditor
              key={index}
              product={product}
              index={index}
              onChange={(nextProduct) =>
                onChange({
                  ...value,
                  products: products.map((item, productIndex) =>
                    productIndex === index ? nextProduct : item,
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...value,
                  products: products.filter((_, productIndex) => productIndex !== index),
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
