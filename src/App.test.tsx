import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import React from 'react';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Just a smoke test to ensure basic rendering works.
    // Adjust selector based on actual App content if needed.
    // For now, checks if the body contains something or if render succeeds.
    expect(document.body).toBeDefined();
  });
});
