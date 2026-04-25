import defaultCart from '../cart-test.json' with { type: 'json' };
import defaultCriteria from '../criteria-test.json' with { type: 'json' };

import type { Cart, Criteria } from '../src/types';

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function loadDefaultCart(): Cart {
  return cloneJson(defaultCart as Cart);
}

export function loadDefaultCriteria(): Criteria {
  return cloneJson(defaultCriteria as Criteria);
}
