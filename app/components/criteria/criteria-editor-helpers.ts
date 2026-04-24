import type {
  ComparisonOperator,
  Criteria,
  CriteriaCondition,
  OperatorCondition,
  Primitive,
} from '@src/types';

export type EditableOperator = ComparisonOperator | 'in';
export type ConditionSelection = 'basic' | EditableOperator | 'and' | 'or';
export type OperatorValue = Primitive | Primitive[];
export type OperatorGroup = OperatorCondition;

export const conditionChoices = {
  basic: { label: '=' },
  gt: { label: '>' },
  gte: { label: '>=' },
  lt: { label: '<' },
  lte: { label: '<=' },
  in: { label: 'in' },
  and: { label: 'and' },
  or: { label: 'or' },
} as const satisfies Record<ConditionSelection, { label: string }>;

export const operatorOptions: EditableOperator[] = ['gt', 'lt', 'gte', 'lte', 'in'];

export function isConditionRecord(value: CriteriaCondition): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasAndCondition(condition: CriteriaCondition): condition is { and: OperatorCondition } {
  return isConditionRecord(condition) && Object.prototype.hasOwnProperty.call(condition, 'and');
}

export function hasOrCondition(condition: CriteriaCondition): condition is { or: OperatorCondition } {
  return isConditionRecord(condition) && Object.prototype.hasOwnProperty.call(condition, 'or');
}

export function getOperatorGroup(condition: CriteriaCondition): OperatorGroup {
  if (!isConditionRecord(condition)) {
    return {};
  }

  if (hasAndCondition(condition)) {
    return condition.and ?? {};
  }

  if (hasOrCondition(condition)) {
    return condition.or ?? {};
  }

  return condition as OperatorGroup;
}

export function getConditionSelection(condition: CriteriaCondition): ConditionSelection {
  if (!isConditionRecord(condition)) {
    return 'basic';
  }

  if (hasAndCondition(condition)) {
    return 'and';
  }

  if (hasOrCondition(condition)) {
    return 'or';
  }

  const directOperator = operatorOptions.find((option) =>
    Object.prototype.hasOwnProperty.call(condition, option),
  );

  return directOperator ?? 'gt';
}

export function renameCriterion(
  criteria: Criteria,
  currentPath: string,
  nextPath: string,
  nextCondition: CriteriaCondition,
): Criteria {
  return Object.entries(criteria).reduce<Criteria>((result, [path, condition]) => {
    if (path === currentPath) {
      result[nextPath] = nextCondition;
      return result;
    }

    result[path] = condition;
    return result;
  }, {});
}

export function removeCriterion(criteria: Criteria, targetPath: string): Criteria {
  return Object.fromEntries(Object.entries(criteria).filter(([path]) => path !== targetPath));
}

export function defaultOperatorValue(operator: EditableOperator): OperatorValue {
  return operator === 'in' ? [''] : '';
}

export function updateOperatorValue(
  group: OperatorGroup,
  operator: EditableOperator,
  nextValue: OperatorValue,
): OperatorGroup {
  return {
    ...group,
    [operator]: nextValue,
  };
}

export function removeOperator(group: OperatorGroup, targetOperator: EditableOperator): OperatorGroup {
  return Object.fromEntries(
    Object.entries(group).filter(([operator]) => operator !== targetOperator),
  ) as OperatorGroup;
}

export function renameOperator(
  group: OperatorGroup,
  currentOperator: EditableOperator,
  nextOperator: EditableOperator,
): OperatorGroup {
  const renamed = Object.entries(group).reduce<Partial<Record<EditableOperator, OperatorValue>>>(
    (result, [operator, value]) => {
      if (operator !== currentOperator) {
        result[operator as EditableOperator] = value as OperatorValue;
        return result;
      }

      result[nextOperator] =
        nextOperator === 'in'
          ? Array.isArray(value)
            ? value
            : [value as Primitive]
          : Array.isArray(value)
            ? ((value[0] ?? '') as Primitive)
            : (value as Primitive);

      return result;
    },
    {},
  );

  return renamed as OperatorGroup;
}

export function addNestedOperator(group: OperatorGroup): OperatorGroup {
  const candidate =
    operatorOptions.find((option) => !Object.prototype.hasOwnProperty.call(group, option)) ?? 'gt';

  return {
    ...group,
    [candidate]: defaultOperatorValue(candidate),
  };
}

export function buildCondition(
  selection: ConditionSelection,
  currentCondition: CriteriaCondition,
): CriteriaCondition {
  if (selection === 'basic') {
    if (!isConditionRecord(currentCondition)) {
      return currentCondition;
    }

    return '';
  }

  if (selection === 'and' || selection === 'or') {
    const currentGroup = getOperatorGroup(currentCondition);
    const nextGroup =
      Object.keys(currentGroup).length > 0 ? currentGroup : ({ gt: '' } as OperatorGroup);

    return selection === 'and' ? { and: nextGroup } : { or: nextGroup };
  }

  return {
    [selection]: defaultOperatorValue(selection),
  } as OperatorCondition;
}
