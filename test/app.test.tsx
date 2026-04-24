import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../app/App';

afterEach(() => {
  cleanup();
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
  it('renders the app shell', () => {
    render(<App />);

    expect(screen.getByLabelText('Lucky Cart')).toBeTruthy();
    expect(screen.getByText('Eligibility Checker')).toBeTruthy();
    expect(screen.getAllByText('Cart')[0]).toBeTruthy();
    expect(screen.getAllByText('Criteria')[0]).toBeTruthy();
    expect(screen.getByTestId('eligibility-result').textContent).toContain('Eligible');
  });

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

  it('toggles the cart panel to raw json and back', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cartPanel = getPanelByTitle('Cart');

    await user.click(within(cartPanel).getByRole('button', { name: 'Raw JSON' }));
    expect(within(cartPanel).getByText(/"cartId": "cart-id"/)).toBeTruthy();

    await user.click(within(cartPanel).getByRole('button', { name: 'Editor' }));
    expect(within(cartPanel).queryByText(/"cartId": "cart-id"/)).toBeNull();
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
});
