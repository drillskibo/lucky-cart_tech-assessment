import type { ComparisonOperator, Criteria, CriteriaCondition } from './types';

type ConditionObject = Record<string, unknown> & {
  and?: Record<string, unknown>;
  or?: Record<string, unknown>;
};

class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   */
  isEligible(cart: unknown, criteria: unknown): boolean {
    const criteriaEntries = Object.entries((criteria ?? {}) as Criteria);

    return criteriaEntries.every(([key, condition]) => {
      const cartValues = this.getValuesByPath(cart, key);
      return this.matchesCondition(cartValues, condition);
    });
  }

  private getValuesByPath(source: unknown, path: string): unknown[] {
    const segments = String(path).split('.');
    return this.collectValues(source, segments);
  }

  private collectValues(current: unknown, segments: string[]): unknown[] {
    if (segments.length === 0) {
      return [current];
    }

    if (current == null) {
      return [];
    }

    if (Array.isArray(current)) {
      return current.flatMap((item) => this.collectValues(item, segments));
    }

    if (!this.isRecord(current)) {
      return [];
    }

    const [head, ...tail] = segments;
    if (!head || !Object.prototype.hasOwnProperty.call(current, head)) {
      return [];
    }

    return this.collectValues(current[head], tail);
  }

  private matchesCondition(cartValues: unknown[], condition: CriteriaCondition): boolean {
    if (!Array.isArray(cartValues) || cartValues.length === 0) {
      return false;
    }

    if (!this.isConditionObject(condition)) {
      return cartValues.some((value) => value == condition);
    }

    const evaluateEntries = (
      entries: [string, unknown][],
      quantifier: 'every' | 'some'
    ): boolean => entries[quantifier](([operator, operatorValue]) =>
      this.matchesOperator(cartValues, operator, operatorValue)
    );

    const conditionObject = condition as ConditionObject;

    if (Object.prototype.hasOwnProperty.call(conditionObject, 'and')) {
      if (!this.isConditionObject(conditionObject.and)) {
        return false;
      }

      return evaluateEntries(Object.entries(conditionObject.and), 'every');
    }

    if (Object.prototype.hasOwnProperty.call(conditionObject, 'or')) {
      if (!this.isConditionObject(conditionObject.or)) {
        return false;
      }

      return evaluateEntries(Object.entries(conditionObject.or), 'some');
    }

    return evaluateEntries(Object.entries(conditionObject), 'every');
  }

  private matchesOperator(cartValues: unknown[], operator: string, expectedValue: unknown): boolean {
    const operatorChecks: Record<ComparisonOperator, (value: unknown, expected: unknown) => boolean> = {
      gt: (value, expected) => (value as string | number) > (expected as string | number),
      lt: (value, expected) => (value as string | number) < (expected as string | number),
      gte: (value, expected) => (value as string | number) >= (expected as string | number),
      lte: (value, expected) => (value as string | number) <= (expected as string | number),
    };

    if (operator === 'in') {
      if (!Array.isArray(expectedValue)) {
        return false;
      }

      return cartValues.some((cartValue) =>
        expectedValue.some((candidate) => cartValue == candidate)
      );
    }

    if (!this.isComparisonOperator(operator)) {
      return false;
    }

    return cartValues.some((value) => operatorChecks[operator](value, expectedValue));
  }

  private isConditionObject(condition: unknown): condition is ConditionObject {
    return condition !== null && typeof condition === 'object' && !Array.isArray(condition);
  }

  private isComparisonOperator(operator: string): operator is ComparisonOperator {
    return operator === 'gt' || operator === 'lt' || operator === 'gte' || operator === 'lte';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

export {
  EligibilityService,
};
