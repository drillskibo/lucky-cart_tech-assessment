import type {
  Criteria,
  CriteriaCondition,
  OperatorCondition,
  Primitive,
} from '@src/types';
import { RiDeleteBinLine } from '@remixicon/react';
import { PrimitiveValueInput } from '@/components/editor-controls';
import {
  addNestedOperator,
  buildCondition,
  conditionChoices,
  type ConditionSelection,
  getConditionSelection,
  getOperatorGroup,
  type EditableOperator,
  operatorOptions,
  removeCriterion,
  removeOperator,
  renameCriterion,
  renameOperator,
  type OperatorGroup,
  type OperatorValue,
  updateOperatorValue,
} from '@/components/criteria/criteria-editor-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';

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
        <div
          key={`${index}-${String(value)}`}
          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
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
        <div key={operator} className="grid gap-2 lg:grid-cols-[3.5rem_minmax(0,1fr)_auto]">
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
            <InListEditor
              values={Array.isArray(operatorValue) ? operatorValue : [operatorValue as Primitive]}
              onChange={(nextValues) => onChange(updateOperatorValue(value, operator, nextValues))}
            />
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
            className="self-start"
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
    <div className="grid gap-2 lg:grid-cols-[4rem_minmax(0,1fr)]">
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
        <InListEditor
          values={Array.isArray(operatorGroup.in) ? operatorGroup.in : ['']}
          onChange={(nextValues) => onChange({ in: nextValues })}
        />
      ) : selection === 'and' || selection === 'or' ? (
        <LogicalGroupEditor
          value={operatorGroup}
          onChange={(nextGroup) =>
            onChange(selection === 'and' ? { and: nextGroup } : { or: nextGroup })
          }
        />
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
        <div key={`${path}-${index}`} className="rounded-lg border border-dashed p-3">
          <div className="grid items-start gap-2 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)]">
            <Button
              variant="destructive"
              size="icon-sm"
              className="self-start mt-1"
              onClick={() => onChange(removeCriterion(value, path))}
              aria-label={`Remove criterion ${path || index + 1}`}
            >
              <RiDeleteBinLine />
            </Button>
            <Input
              value={path}
              onChange={(event) =>
                onChange(renameCriterion(value, path, event.target.value, condition))
              }
              placeholder="Cart path"
            />

            <ConditionEditor
              value={condition}
              onChange={(nextCondition) =>
                onChange(renameCriterion(value, path, path, nextCondition))
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
