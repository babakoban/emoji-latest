import { CATEGORY_EMPTY_SPACE, Symb } from '../symbol.js';

export class Wildcard extends Symb {
  static emoji = '🃏';
  constructor() {
    super();
    this.rarity = -0.15;
  }
  copy() {
    return new Wildcard();
  }
  scoresLate() {
    return true;
  }
  async score(game, x, y) {
    const coords = game.board.nextToExpr(
      x,
      y,
      (sym) => !sym.categories().includes(CATEGORY_EMPTY_SPACE)
    );
    if (coords.length === 0) {
      return;
    }
    let best = -Infinity;
    for (const [nx, ny] of coords) {
      const paid = game.board.cells[ny][nx].turnMoney || 0;
      if (paid > best) {
        best = paid;
      }
    }
    if (!Number.isFinite(best) || best === 0) {
      return;
    }
    await this.addMoney(game, best, x, y);
  }
  description() {
    return '[Pays](pays) the same as the highest-paying neighboring item';
  }
}
