import { describe, it, expect, beforeEach } from 'vitest';
import { setSeed } from '../../src/core/rng.js';
import { CATEGORY_EMPTY_SPACE, CATEGORY_UNBUYABLE } from '../../src/symbol.js';
import { Wildcard } from '../../src/symbols/wildcard.js';
import { buildGame } from './helpers/fakeGame.js';
import { expectMoney } from './helpers/assertions.js';

describe('wildcard.js', () => {
  beforeEach(async () => {
    await setSeed('wildcard');
  });

  describe('Wildcard 🃏', () => {
    it('is buyable and scores after neighbors', () => {
      const joker = new Wildcard();
      expect(joker.categories()).not.toContain(CATEGORY_UNBUYABLE);
      expect(joker.categories()).not.toContain(CATEGORY_EMPTY_SPACE);
      expect(joker.transformsOnRoll()).toBe(false);
      expect(joker.scoresLate()).toBe(true);
      expect(joker.rarity).toBe(-0.15);
    });

    it('pays nothing next to empty space', async () => {
      const { game, board } = buildGame({ grid: ['🃏 ⬜'], startingMoney: 0 });
      await board.score(game);
      expectMoney(game, 0);
    });

    it('copies a neighboring 🪙 payout', async () => {
      const { game, board } = buildGame({ grid: ['🃏 🪙'], startingMoney: 0 });
      await board.score(game);
      // 🪙 pays 2; 🃏 copies 2
      expectMoney(game, 4);
    });

    it('copies the highest of two neighboring payouts', async () => {
      const { game, board } = buildGame({
        grid: ['⬜ ⬜ ⬜', '💎 🃏 🪙', '⬜ ⬜ ⬜'],
        startingMoney: 0,
      });
      await board.score(game);
      // 💎 pays 7 (no row/col bonus), 🪙 pays 2, 🃏 copies 7
      expectMoney(game, 7 + 2 + 7);
    });

    it('copies the neighbor amount after that neighbor’s multiplier', async () => {
      const { game, board } = buildGame({
        grid: ['🃏 🪙'],
        startingMoney: 0,
      });
      board.cells[0][1].multiplier = 2;
      await board.score(game);
      // 🪙 pays 4; 🃏 copies 4
      expectMoney(game, 8);
    });

    it('applies its own multiplier on top of the copied amount', async () => {
      const { game, board } = buildGame({
        grid: ['🃏 🪙'],
        startingMoney: 0,
      });
      board.cells[0][0].multiplier = 2;
      await board.score(game);
      // 🪙 pays 2; 🃏 copies 2 then x2
      expectMoney(game, 6);
    });

    it('two wildcards each copy the same neighbor, not each other', async () => {
      const { game, board } = buildGame({
        grid: ['🪙 🃏 🃏'],
        startingMoney: 0,
      });
      await board.score(game);
      // 🪙 pays 2; each 🃏 copies 2
      expectMoney(game, 6);
    });
  });
});
