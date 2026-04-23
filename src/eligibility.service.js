class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    const entries = Object.entries(criteria || {});

    return entries.every(([key, condition]) => {
      const cartValues = this.getValuesByPath(cart, key);
      return this.matchesCondition(cartValues, condition);
    });
  }

  getValuesByPath(source, path) {
    const segments = String(path).split('.');
    return this.collectValues(source, segments);
  }

  collectValues(current, segments) {
    if (segments.length === 0) {
      return [current];
    }
    if (current == null) {
      return [];
    }

    if (Array.isArray(current)) {
      return current.flatMap((item) => this.collectValues(item, segments));
    }

    if (typeof current !== 'object') {
      return [];
    }

    const [head, ...tail] = segments;
    if (!Object.prototype.hasOwnProperty.call(current, head)) {
      return [];
    }
    return this.collectValues(current[head], tail);
  }

  matchesCondition(cartValues, condition) {
    if (!Array.isArray(cartValues) || cartValues.length === 0) {
      return false;
    }

    if (!this.isConditionObject(condition)) {
      return cartValues.some((value) => value == condition);
    }

    const evaluateEntries = (entries, quantifier) => entries[quantifier](([operator, operatorValue]) =>
      this.matchesOperator(cartValues, operator, operatorValue)
    );

    if (Object.prototype.hasOwnProperty.call(condition, 'and')) {
      if (!this.isConditionObject(condition.and)) {
        return false;
      }
      return evaluateEntries(Object.entries(condition.and), 'every');
    }

    if (Object.prototype.hasOwnProperty.call(condition, 'or')) {
      if (!this.isConditionObject(condition.or)) {
        return false;
      }
      return evaluateEntries(Object.entries(condition.or), 'some');
    }

    return evaluateEntries(Object.entries(condition), 'every');
  }

  matchesOperator(cartValues, operator, expectedValue) {
    const operatorChecks = {
      gt: (value) => value > expectedValue,
      lt: (value) => value < expectedValue,
      gte: (value) => value >= expectedValue,
      lte: (value) => value <= expectedValue,
    };

    if (operator === 'in') {
      if (!Array.isArray(expectedValue)) {
        return false;
      }
      return cartValues.some((cartValue) =>
        expectedValue.some((candidate) =>
          cartValue == candidate
        )
      );
    }

    const check = operatorChecks[operator];
    if (check) {
      return cartValues.some((value) => check(value));
    }

    return false;
  }

  isConditionObject(condition) {
    return condition !== null && typeof condition === 'object' && !Array.isArray(condition);
  }
}

module.exports = {
  EligibilityService,
};
