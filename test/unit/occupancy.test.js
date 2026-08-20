import { describe, it, expect, beforeEach } from 'vitest';
import { setSeed } from '../../src/core/rng.js';
import { Inventory } from '../../src/inventory.js';
import { makeSpyRenderer } from './helpers/spyRenderer.js';
import { buildRealCatalog } from './helpers/realGame.js';
import { buildGame } from './helpers/fakeGame.js';
import * as Const from '../../src/consts.js';

describe('item and space HUD', () => {
  beforeEach(async () => {
    await setSeed('occupancy');
  });

  describe('Inventory', () => {
    let inventory;
    let spy;

    beforeEach(async () => {
      const catalog = await buildRealCatalog();
      spy = makeSpyRenderer();
      inventory = new Inventory(
        {
          boardX: 5,
          boardY: 5,
          gameLength: 50,
          startingSet: '🍒🍒🪙',
        },
        catalog,
        spy
      );
    });

    const lastResources = () => {
      const calls = spy.calls.filter((c) => c.method === 'renderResources');
      return calls[calls.length - 1].args[0];
    };
    const hudValue = (emoji) =>
      lastResources().find((entry) => entry.emoji === emoji).value;

    it('shows item/space counts in the resource bar on construct', () => {
      expect(hudValue(Const.ITEMS)).toBe('3/25');
    });

    it('updates the item count when a symbol is added or removed', () => {
      const extra = inventory.catalog.symbol('🍀');
      inventory.add(extra);
      expect(hudValue(Const.ITEMS)).toBe('4/25');
      inventory.remove(extra);
      expect(hudValue(Const.ITEMS)).toBe('3/25');
    });

    it('updates the space count when a row is added', () => {
      inventory.addRows(1);
      expect(hudValue(Const.ITEMS)).toBe('3/30');
    });

    it('sits after turns and before luck, with passives last', async () => {
      await inventory.addResource('💸', 1);
      expect(lastResources().map((entry) => entry.emoji)).toEqual([
        Const.MONEY,
        Const.TURNS,
        Const.ITEMS,
        Const.LUCK,
        '💸',
      ]);
    });
  });

  describe('Rows 🎰', () => {
    it('grows space count through addRows', async () => {
      const { game, board, inventory } = buildGame({ grid: ['🎰 ⬜'] });
      const before = inventory.rowCount;
      await board.cells[0][0].evaluateProduce(game, 0, 0);
      expect(inventory.rowCount).toBe(before + 1);
    });
  });
});
