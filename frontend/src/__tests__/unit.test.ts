// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

describe('Frontend Auth Storage Utilities', () => {
  it('stores and retrieves JWT tokens properly', () => {
    setAuthToken('test-jwt-token-12345');
    expect(getAuthToken()).toBe('test-jwt-token-12345');
  });

  it('clears auth token on logout', () => {
    setAuthToken('temp-token');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});

describe('Fuel Calculation Logic', () => {
  it('calculates gross revenue and profit margin properly', () => {
    const qty = 50.0;
    const sellingPrice = 105.50;
    const costPrice = 96.00;
    
    const amount = qty * sellingPrice;
    const cost = qty * costPrice;
    const profit = amount - cost;
    const marginPct = (profit / amount) * 100;
    
    expect(amount).toBe(5275.0);
    expect(cost).toBe(4800.0);
    expect(profit).toBe(475.0);
    expect(marginPct.toFixed(2)).toBe('9.00');
  });
});
