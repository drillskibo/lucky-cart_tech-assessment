import { loadDefaultCart, loadDefaultCriteria } from './fixtures';

import type { Cart, Criteria } from '@src/types';

export const LOCAL_STORAGE_KEYS = {
  cart: 'lucky-cart.cart',
  criteria: 'lucky-cart.criteria',
} as const;

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadStoredValue<T>(key: string, fallback: () => T): T {
  if (!canUseLocalStorage()) {
    return fallback();
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallback();
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return isJsonObject(parsedValue) ? (parsedValue as T) : fallback();
  } catch {
    return fallback();
  }
}

function saveStoredValue(key: string, value: unknown) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadInitialCart(): Cart {
  return loadStoredValue(LOCAL_STORAGE_KEYS.cart, loadDefaultCart);
}

export function loadInitialCriteria(): Criteria {
  return loadStoredValue(LOCAL_STORAGE_KEYS.criteria, loadDefaultCriteria);
}

export function saveCart(cart: Cart) {
  saveStoredValue(LOCAL_STORAGE_KEYS.cart, cart);
}

export function saveCriteria(criteria: Criteria) {
  saveStoredValue(LOCAL_STORAGE_KEYS.criteria, criteria);
}

export function resetPersistedData() {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.cart);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.criteria);
}
