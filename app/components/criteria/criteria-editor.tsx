import { RiDeleteBinLine } from '@remixicon/react';

import {
  type ConditionSelection,
  type EditableOperator,
  type OperatorGroup,
  type OperatorValue,
  addNestedOperator,
  buildCondition,
  conditionChoices,
  getConditionSelection,
  getOperatorGroup,
  operatorOptions,
  removeCriterion,
  removeOperator,
  renameCriterion,
  renameOperator,
  updateOperatorValue,
} from '@/components/criteria/criteria-editor-helpers';
import { PrimitiveValueInput } from '@/components/editor-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';

import type { Criteria, CriteriaCondition, OperatorCondition, Primitive } from '@src/types';

type CriteriaEditorProps = {
  value: Criteria;
  onChange: (value: Criteria) => void;
  onAddCriteria: () => void;
};

function InListEditor({
  values,
  onChange,
}: {
  values: Primitive[];
  onChange: (values: Primitive[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <PrimitiveValueInput
            value={value}
            onChange={(nextValue) =>
              onChange(values.map((item, itemIndex) => (itemIndex === index ? nextValue : item)))
            }
            placeholder="Allowed value"
          />
          <Button
            variant="destructive"
            size="icon-sm"
            className="self-center"
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            aria-label={`Remove value ${index + 1}`}
          >
            <RiDeleteBinLine />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...values, ''])}>
        Add value
      </Button>
    </div>
  );
}

function LogicalGroupEditor({
  value,
  onChange,
}: {
  value: OperatorGroup;
  onChange: (value: OperatorGroup) => void;
}) {
  const entries = Object.entries(value) as [EditableOperator, OperatorValue][];

  return (
    <div className="space-y-2">
      {entries.map(([operator, operatorValue]) => (
        <div key={operator} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-2">
          <NativeSelect
            value={operator}
            onChange={(event) =>
              onChange(renameOperator(value, operator, event.target.value as EditableOperator))
            }
          >
            {operatorOptions.map((option) => (
              <option key={option} value={option}>
                {conditionChoices[option].label}
              </option>
            ))}
          </NativeSelect>

          {operator === 'in' ? (
            <div className="min-w-0">
              <InListEditor
                values={Array.isArray(operatorValue) ? operatorValue : [operatorValue as Primitive]}
                onChange={(nextValues) =>
                  onChange(updateOperatorValue(value, operator, nextValues))
                }
              />
            </div>
          ) : (
            <PrimitiveValueInput
              value={
                Array.isArray(operatorValue)
                  ? ((operatorValue[0] ?? '') as Primitive)
                  : (operatorValue as Primitive)
              }
              onChange={(nextValue) => onChange(updateOperatorValue(value, operator, nextValue))}
              placeholder="Value"
            />
          )}

          <Button
            variant="destructive"
            size="icon-sm"
            className="self-center"
            onClick={() => onChange(removeOperator(value, operator))}
            aria-label={`Remove ${operator} condition`}
          >
            <RiDeleteBinLine />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={() => onChange(addNestedOperator(value))}>
        Add nested condition
      </Button>
    </div>
  );
}

function ConditionEditor({
  value,
  onChange,
}: {
  value: CriteriaCondition;
  onChange: (value: CriteriaCondition) => void;
}) {
  const selection = getConditionSelection(value);
  const operatorGroup = getOperatorGroup(value);

  return (
    <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-2">
      <NativeSelect
        value={selection}
        onChange={(event) =>
          onChange(buildCondition(event.target.value as ConditionSelection, value))
        }
      >
        {(Object.keys(conditionChoices) as ConditionSelection[]).map((option) => (
          <option key={option} value={option}>
            {conditionChoices[option].label}
          </option>
        ))}
      </NativeSelect>

      {selection === 'basic' ? (
        <PrimitiveValueInput
          value={value as Primitive}
          onChange={(nextValue) => onChange(nextValue)}
          placeholder="Value"
        />
      ) : selection === 'in' ? (
        <div className="min-w-0">
          <InListEditor
            values={Array.isArray(operatorGroup.in) ? operatorGroup.in : ['']}
            onChange={(nextValues) => onChange({ in: nextValues })}
          />
        </div>
      ) : selection === 'and' || selection === 'or' ? (
        <div className="min-w-0">
          <LogicalGroupEditor
            value={operatorGroup}
            onChange={(nextGroup) =>
              onChange(selection === 'and' ? { and: nextGroup } : { or: nextGroup })
            }
          />
        </div>
      ) : (
        <PrimitiveValueInput
          value={(operatorGroup[selection] as Primitive | undefined) ?? ''}
          onChange={(nextValue) => onChange({ [selection]: nextValue } as OperatorCondition)}
          placeholder="Value"
        />
      )}
    </div>
  );
}

export function CriteriaEditor({ value, onChange, onAddCriteria }: CriteriaEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onAddCriteria}>
          Add criteria
        </Button>
      </div>

      {Object.entries(value).map(([path, condition], index) => (
        <div key={index} className="rounded-lg border border-dashed p-3">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
            <Button
              variant="destructive"
              size="icon-sm"
              className="mt-1 shrink-0 self-start"
              onClick={() => onChange(removeCriterion(value, path))}
              aria-label={`Remove criterion ${path || index + 1}`}
            >
              <RiDeleteBinLine />
            </Button>

            <div className="min-w-0">
              <div className="grid min-w-0 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
                <Input
                  className="min-w-0"
                  value={path}
                  onChange={(event) =>
                    onChange(renameCriterion(value, path, event.target.value, condition))
                  }
                  placeholder="Cart path"
                />

                <div className="min-w-0">
                  <ConditionEditor
                    value={condition}
                    onChange={(nextCondition) =>
                      onChange(renameCriterion(value, path, path, nextCondition))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
