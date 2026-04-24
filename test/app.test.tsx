import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

describe('App', () => {
  it('renders the app shell', () => {
    render(<App />);

    expect(screen.getByText('Lucky Cart')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Answer GUI' })).toBeTruthy();
  });
});
