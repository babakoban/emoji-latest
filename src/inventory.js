import * as Const from './consts.js';
import * as Util from './util.js';

export class Inventory {
  constructor(settings, catalog, renderer) {
    this.settings = settings;
    this.catalog = catalog;
    this.renderer = renderer;
    this.symbols = catalog.symbolsFromString(settings.startingSet);

    this.resources = {};
    this.resources[Const.MONEY] = 1;
    this.resources[Const.TURNS] = settings.gameLength;
    this.resources[Const.LUCK] = 0;
    this.tempLuckBonus = 0;
    this.graveyard = [];
    this.giftsOpened = 0;
    this.rowCount = settings.boardY;
    this.updateUi();
    // Set by Game right after construction (see game.js); stays null until
    // then because Inventory's own constructor already calls updateUi().
    this.stats = null;
  }
  update() {
    const map = new Map();
    this.symbols.forEach((symbol) => {
      const name = symbol.emoji();
      if (!map.has(name)) {
        map.set(name, { count: 0, description: symbol.description() });
      }
      map.set(name, {
        count: map.get(name).count + 1,
        description: symbol.description(),
      });
    });
    const entries = Array.from(map, ([emoji, { count, description }]) => ({
      emoji,
      count,
      description,
    }));
    this.renderer.renderInventory(entries);
    this.updateUi();
  }
  remove(symbol, { toGraveyard = true } = {}) {
    const index = this.symbols.indexOf(symbol);
    if (index >= 0) {
      this.symbols.splice(index, 1);
    }
    this.update();
    if (toGraveyard) {
      this.graveyard.push(symbol);
    }
  }
  add(symbol) {
    this.symbols.push(symbol);
    this.update();
  }
  getResource(key) {
    if (this.resources[key] === undefined) {
      return 0;
    }
    return this.resources[key];
  }
  async addResource(key, value) {
    if (this.resources[key] === undefined) {
      this.resources[key] = 0;
    }
    this.resources[key] += value;
    if (key === Const.MONEY && value > 0) {
      this.stats?.recordMoneyEarned(value);
    }
    this.updateUi();
  }
  addLuck(bonus) {
    this.tempLuckBonus += bonus;
    // `this.updateUi()` -- This call is not needed here!
    // `resetLuck`` is the function to call when luck calculation finished in last turn's Board::score.
    // We technically always use last turn's luck to avoid another round of scoring.
  }
  resetLuck() {
    this.resources[Const.LUCK] = this.tempLuckBonus;
    this.tempLuckBonus = 0;
    this.updateUi();
  }
  resetRows() {
    this.rowCount = this.settings.boardY;
    this.updateUi();
  }
  addRows(n = 1) {
    this.rowCount += n;
    this.updateUi();
  }
  occupancy() {
    return this.rowCount * this.settings.boardX - this.symbols.length;
  }
  updateUi() {
    const toEntry = (emoji, value) => ({
      emoji,
      value,
      description: this.catalog.symbol(emoji).description(),
    });
    // Core HUD stays left: 💵, ⏰, 💫, empty spaces this spin. Passives append after.
    const core = [
      [Const.MONEY, this.getResource(Const.MONEY)],
      [Const.TURNS, this.getResource(Const.TURNS)],
      [Const.LUCK, this.getResource(Const.LUCK)],
      [Const.ITEMS, this.occupancy()],
    ];
    const coreKeys = new Set(core.map(([emoji]) => emoji));
    const entries = core.map(([emoji, value]) => toEntry(emoji, value));
    for (const [emoji, value] of Object.entries(this.resources)) {
      if (coreKeys.has(emoji)) {
        continue;
      }
      entries.push(toEntry(emoji, value));
    }
    this.renderer.renderResources(entries);
  }
  // Note: This does NOT return a Symbol. It returns an emoji text character for animation purposes.
  getRandomOwnedEmoji() {
    if (this.symbols.length === 0) {
      return Const.EMPTY;
    }
    return Util.randomChoose(this.symbols).displayEmoji();
  }
}
