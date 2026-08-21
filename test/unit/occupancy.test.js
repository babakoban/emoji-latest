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
          boardX: 2,
          boardY: 2,
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
    const occupancy = () =>
      lastResources().find((entry) => entry.emoji === Const.ITEMS).value;

    it('shows empty spaces this spin on construct', () => {
      // 3 items, 4 spaces
      expect(occupancy()).toBe(1);
    });

    it('turns 0, then -1, as items fill and exceed the board', () => {
      inventory.add(inventory.catalog.symbol('🍀'));
      expect(occupancy()).toBe(0);
      inventory.add(inventory.catalog.symbol('🍀'));
      expect(occupancy()).toBe(-1);
    });

    it('updates when a row is added', () => {
      inventory.add(inventory.catalog.symbol('🍀'));
      inventory.add(inventory.catalog.symbol('🍀'));
      expect(occupancy()).toBe(-1);
      inventory.addRows(1);
      // 5 items, 6 spaces
      expect(occupancy()).toBe(1);
    });

    it('sits after luck, with passives last', async () => {
      await inventory.addResource('💸', 1);
      expect(lastResources().map((entry) => entry.emoji)).toEqual([
        Const.MONEY,
        Const.TURNS,
        Const.LUCK,
        Const.ITEMS,
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
