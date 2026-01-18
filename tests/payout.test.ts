import { describe, it, expect } from 'vitest';
import { calculatePayout } from '../src/lib/utils';

describe('calculatePayout', () => {
  describe('percentage-based payouts', () => {
    it('should calculate correct payout for 10% commission on $1000 booking', () => {
      const result = calculatePayout(1000, 0.10, null);
      
      // Base payout: $1000 * 0.10 = $100
      // Platform fee from host: $100 * 0.15 = $15
      // Platform fee from creator: $100 * 0.15 = $15
      // Host pays: $100 + $15 = $115
      // Creator receives: $100 - $15 = $85
      
      expect(result.creatorPayout).toBe(85);
      expect(result.platformFeeHost).toBe(15);
      expect(result.platformFeeCreator).toBe(15);
      expect(result.hostTotal).toBe(115);
    });

    it('should calculate correct payout for 15% commission on $500 booking', () => {
      const result = calculatePayout(500, 0.15, null);
      
      // Base payout: $500 * 0.15 = $75
      // Platform fee from host: $75 * 0.15 = $11.25
      // Platform fee from creator: $75 * 0.15 = $11.25
      // Host pays: $75 + $11.25 = $86.25
      // Creator receives: $75 - $11.25 = $63.75
      
      expect(result.creatorPayout).toBe(63.75);
      expect(result.platformFeeHost).toBe(11.25);
      expect(result.platformFeeCreator).toBe(11.25);
      expect(result.hostTotal).toBe(86.25);
    });

    it('should apply max payout cap when set', () => {
      const result = calculatePayout(5000, 0.20, null, 200);
      
      // Base payout would be $5000 * 0.20 = $1000, but capped at $200
      // Platform fee from host: $200 * 0.15 = $30
      // Platform fee from creator: $200 * 0.15 = $30
      // Host pays: $200 + $30 = $230
      // Creator receives: $200 - $30 = $170
      
      expect(result.creatorPayout).toBe(170);
      expect(result.platformFeeHost).toBe(30);
      expect(result.platformFeeCreator).toBe(30);
      expect(result.hostTotal).toBe(230);
    });
  });

  describe('flat-fee payouts', () => {
    it('should calculate correct payout for $50 flat fee', () => {
      const result = calculatePayout(1000, null, 50);
      
      // Base payout: $50 (flat)
      // Platform fee from host: $50 * 0.15 = $7.50
      // Platform fee from creator: $50 * 0.15 = $7.50
      // Host pays: $50 + $7.50 = $57.50
      // Creator receives: $50 - $7.50 = $42.50
      
      expect(result.creatorPayout).toBe(42.5);
      expect(result.platformFeeHost).toBe(7.5);
      expect(result.platformFeeCreator).toBe(7.5);
      expect(result.hostTotal).toBe(57.5);
    });

    it('should calculate correct payout for $100 flat fee', () => {
      const result = calculatePayout(2000, null, 100);
      
      // Base payout: $100 (flat, booking amount doesn't matter)
      // Platform fee from host: $100 * 0.15 = $15
      // Platform fee from creator: $100 * 0.15 = $15
      // Host pays: $100 + $15 = $115
      // Creator receives: $100 - $15 = $85
      
      expect(result.creatorPayout).toBe(85);
      expect(result.platformFeeHost).toBe(15);
      expect(result.platformFeeCreator).toBe(15);
      expect(result.hostTotal).toBe(115);
    });

    it('should apply max payout cap even for flat fees', () => {
      const result = calculatePayout(500, null, 150, 100);
      
      // Flat fee is $150 but capped at $100
      // Platform fees on $100
      
      expect(result.creatorPayout).toBe(85);
      expect(result.platformFeeHost).toBe(15);
      expect(result.platformFeeCreator).toBe(15);
      expect(result.hostTotal).toBe(115);
    });
  });

  describe('edge cases', () => {
    it('should handle zero booking amount with flat fee', () => {
      const result = calculatePayout(0, null, 75);
      
      expect(result.creatorPayout).toBe(63.75);
      expect(result.platformFeeHost).toBe(11.25);
      expect(result.platformFeeCreator).toBe(11.25);
      expect(result.hostTotal).toBe(86.25);
    });

    it('should handle small booking amounts', () => {
      const result = calculatePayout(50, 0.10, null);
      
      // Base payout: $50 * 0.10 = $5
      // Platform fees: $5 * 0.15 = $0.75
      
      expect(result.creatorPayout).toBe(4.25);
      expect(result.platformFeeHost).toBe(0.75);
      expect(result.platformFeeCreator).toBe(0.75);
      expect(result.hostTotal).toBe(5.75);
    });

    it('should round to 2 decimal places', () => {
      const result = calculatePayout(333, 0.11, null);
      
      // Base payout: $333 * 0.11 = $36.63
      // Platform fees: $36.63 * 0.15 = $5.4945 -> $5.49
      
      expect(result.creatorPayout).toBeCloseTo(31.14, 2);
      expect(result.platformFeeHost).toBeCloseTo(5.49, 2);
      expect(result.platformFeeCreator).toBeCloseTo(5.49, 2);
      expect(result.hostTotal).toBeCloseTo(42.12, 2);
    });

    it('should return zero when both percent and flat are null', () => {
      const result = calculatePayout(1000, null, null);
      
      expect(result.creatorPayout).toBe(0);
      expect(result.platformFeeHost).toBe(0);
      expect(result.platformFeeCreator).toBe(0);
      expect(result.hostTotal).toBe(0);
    });

    it('should use percentRate when both are provided (percent takes precedence)', () => {
      const result = calculatePayout(1000, 0.10, 50);
      
      // Should use 10% of $1000 = $100, not the $50 flat
      expect(result.creatorPayout).toBe(85);
      expect(result.hostTotal).toBe(115);
    });
  });

  describe('platform revenue verification', () => {
    it('should ensure platform collects 30% total (15% from each side)', () => {
      const result = calculatePayout(1000, 0.10, null);
      
      const basePayout = 100; // 10% of $1000
      const totalPlatformRevenue = result.platformFeeHost + result.platformFeeCreator;
      
      // Platform should collect 30% of base payout
      expect(totalPlatformRevenue).toBe(basePayout * 0.30);
      expect(totalPlatformRevenue).toBe(30);
    });

    it('should verify host total minus creator payout equals platform revenue', () => {
      const result = calculatePayout(850, 0.12, null);
      
      // hostTotal - creatorPayout = platform revenue
      const impliedPlatformRevenue = result.hostTotal - result.creatorPayout;
      const actualPlatformRevenue = result.platformFeeHost + result.platformFeeCreator;
      
      expect(impliedPlatformRevenue).toBeCloseTo(actualPlatformRevenue, 2);
    });
  });
});
