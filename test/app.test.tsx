import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import App from '../app/App';
import { LOCAL_STORAGE_KEYS } from '../app/persistence';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function getPanelByTitle(title: 'Cart' | 'Criteria') {
  const heading = screen.getAllByText(title)[0];
  const panel = heading.closest('[data-slot="card"]');

  if (!(panel instanceof HTMLElement)) {
    throw new Error(`${title} panel not found`);
  }

  return panel;
}

describe('App', () => {
  describe('shell', () => {
    it('renders the app shell', () => {
      render(<App />);

      expect(screen.getByLabelText('Lucky Cart')).toBeTruthy();
      expect(screen.getByText('Eligibility Checker')).toBeTruthy();
      expect(screen.getAllByText('Cart')[0]).toBeTruthy();
      expect(screen.getAllByText('Criteria')[0]).toBeTruthy();
      expect(screen.getByTestId('eligibility-result').textContent).toContain('Eligible');
    });
  });

  describe('structured editing', () => {
    it('adds and removes a cart product', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      const getRemoveProductButtons = () =>
        within(cartPanel).getAllByRole('button', { name: /^Remove product$/i });

      expect(getRemoveProductButtons()).toHaveLength(2);

      await user.click(within(cartPanel).getByRole('button', { name: 'Add product' }));
      expect(getRemoveProductButtons()).toHaveLength(3);

      await user.click(getRemoveProductButtons()[2]);
      expect(getRemoveProductButtons()).toHaveLength(2);
    });

    it('adds and removes a criteria row', async () => {
      const user = userEvent.setup();
      render(<App />);

      const criteriaPanel = getPanelByTitle('Criteria');

      await user.click(within(criteriaPanel).getByRole('button', { name: 'Add criteria' }));
      expect(within(criteriaPanel).getByDisplayValue('field')).toBeTruthy();

      await user.click(within(criteriaPanel).getByRole('button', { name: 'Remove criterion field' }));
      expect(within(criteriaPanel).queryByDisplayValue('field')).toBeNull();
    });

    it('updates eligibility when cart data changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      const shopperIdKeyInput = within(cartPanel).getByDisplayValue('shopperId');
      const shopperIdRow = shopperIdKeyInput.closest('div.grid');

      if (!(shopperIdRow instanceof HTMLElement)) {
        throw new Error('shopperId row not found');
      }

      const shopperIdInputs = within(shopperIdRow).getAllByRole('textbox');

      await user.clear(shopperIdInputs[1]);
      await user.type(shopperIdInputs[1], 'different-shopper');

      expect(screen.getByTestId('eligibility-result').textContent).toContain('Not eligible');
    });

    it('keeps focus while renaming cart and criteria fields', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      const cartFieldNameInput = within(cartPanel).getByDisplayValue('cartId');

      await user.click(cartFieldNameInput);
      await user.type(cartFieldNameInput, 'X');
      expect(document.activeElement).toBe(cartFieldNameInput);

      const criteriaPanel = getPanelByTitle('Criteria');
      const criteriaPathInput = within(criteriaPanel).getByDisplayValue('shopperId');

      await user.click(criteriaPathInput);
      await user.type(criteriaPathInput, 'X');
      expect(document.activeElement).toBe(criteriaPathInput);
    });
  });

  describe('raw json mode', () => {
    it('toggles the cart panel to raw json and back', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');

      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));
      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });
      expect((cartJsonEditor as HTMLTextAreaElement).value).toContain('"cartId": "cart-id"');

      await user.click(within(cartPanel).getByRole('button', { name: 'Editor' }));
      expect(within(cartPanel).queryByRole('textbox', { name: 'Cart JSON editor' })).toBeNull();
    });

    it('updates the app when valid raw json is edited', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));

      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });

      fireEvent.change(cartJsonEditor, {
        target: {
          value:
            '{\n  "cartId": "cart-id",\n  "shopperId": "different-shopper",\n  "products": []\n}',
        },
      });

      expect(screen.getByTestId('eligibility-result').textContent).toContain('Not eligible');
    });

    it('shows a validation error without overwriting the current state', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));

      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });

      fireEvent.change(cartJsonEditor, {
        target: {
          value: '{',
        },
      });

      expect(within(cartPanel).getByText('JSON is invalid.')).toBeTruthy();
      expect(screen.getByTestId('eligibility-result').textContent).toContain('Eligible');

      await user.click(within(cartPanel).getByRole('button', { name: 'Editor' }));
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));
      const resetCartJsonEditor = within(cartPanel).getByRole('textbox', {
        name: 'Cart JSON editor',
      });
      expect((resetCartJsonEditor as HTMLTextAreaElement).value).toContain('"cartId": "cart-id"');
    });
  });

  describe('persistence', () => {
    it('loads default fixture data when localStorage is empty', async () => {
      const user = userEvent.setup();
      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));

      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });
      expect((cartJsonEditor as HTMLTextAreaElement).value).toContain('"cartId": "cart-id"');
    });

    it('prefers stored cart and criteria values when localStorage is populated', async () => {
      const user = userEvent.setup();

      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.cart,
        JSON.stringify({
          cartId: 'stored-cart',
          shopperId: 'stored-shopper',
          products: [],
        }),
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.criteria,
        JSON.stringify({
          shopperId: 'stored-shopper',
        }),
      );

      render(<App />);

      const cartPanel = getPanelByTitle('Cart');
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));
      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });
      expect((cartJsonEditor as HTMLTextAreaElement).value).toContain('"cartId": "stored-cart"');

      const criteriaPanel = getPanelByTitle('Criteria');
      await user.click(within(criteriaPanel).getByRole('button', { name: 'Raw JSON' }));
      const criteriaJsonEditor = within(criteriaPanel).getByRole('textbox', {
        name: 'Criteria JSON editor',
      });
      expect((criteriaJsonEditor as HTMLTextAreaElement).value).toContain(
        '"shopperId": "stored-shopper"',
      );
    });

    it('resets persisted data back to defaults without touching unrelated keys', async () => {
      const user = userEvent.setup();

      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.cart,
        JSON.stringify({
          cartId: 'stored-cart',
          shopperId: 'stored-shopper',
          products: [],
        }),
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.criteria,
        JSON.stringify({
          shopperId: 'stored-shopper',
        }),
      );
      window.localStorage.setItem('unrelated.key', 'keep-me');

      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Reset data' }));

      expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.cart)).toContain('"cartId":"cart-id"');
      expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.criteria)).toContain('"shopperId":"shopper-id"');
      expect(window.localStorage.getItem('unrelated.key')).toBe('keep-me');

      const cartPanel = getPanelByTitle('Cart');
      await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));
      const cartJsonEditor = within(cartPanel).getByRole('textbox', { name: 'Cart JSON editor' });
      expect((cartJsonEditor as HTMLTextAreaElement).value).toContain('"cartId": "cart-id"');
    });
  });
});
