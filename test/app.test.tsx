import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

describe('App', () => {
  it('renders the app shell', () => {
    render(<App />);

    expect(screen.getByLabelText('Lucky Cart')).toBeTruthy();
    expect(screen.getByText('Eligibility Checker')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
    expect(screen.getByText('Criteria')).toBeTruthy();
    expect(screen.getByTestId('eligibility-result').textContent).toContain('Eligible');
  });
});
