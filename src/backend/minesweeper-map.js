const MINE = -1;

class MineSweeperMap {

  constructor(width, height, minePercentage) {

    if(!Number.isInteger(width)) {
      throw new Error('MineSweeperMap expects width to be an integer');
    }

    if(!Number.isInteger(height)) {
      throw new Error('MineSweeperMap expects height to be an integer');
    }

    if(Number(minePercentage) !== minePercentage || minePercentage % 1 === 0) {
      throw new Error('MineSweeperMap expects height to be a float');
    }

    this.width = width;
    this.height = height;
    this.minPercentage = minePercentage;
  }

  reset() {
    this.map = [];
    for (let r = 0; r < this.height; r++) {
      this.map[r] = [];
    }

    this.points = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        this.points.push([r, c]);
      }
    }
  }

  setMines() {
    const mineCount = Math.round(this.minPercentage * this.points.length);

    for (let i = 0; i < mineCount; i++) {
      const index = Math.floor(Math.random() * this.points.length);
      const [r, c] = this.points.splice(index, 1)[0];
      this.map[r][c] = MINE;
    }
  }

  setNumbers() {
    this.points.forEach(([hintR, hintC]) => this.map[hintR][hintC] = this.mineCount(hintR, hintC));
  }

  generateMap() {
    this.reset();
    this.setMines();
    this.setNumbers();
    return this.map;
  };

  mineCount(r, c) {
    const range = [-1, 0, 1];
    let result = 0;

    range.forEach(hor => range.forEach(ver => {
        if (!(ver === 0 && hor === 0)) {
          if (this.map[r - hor] && this.map[r - hor][c - ver] === MINE) {
            result++;
          }
        }
      })
    );

    return result;
  }

  toString() {
    return this.map.map(row => row.map(cell => cell === MINE ? '□' : cell).join());
  }
}

module.exports = MineSweeperMap;