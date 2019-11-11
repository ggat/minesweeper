const
  SESSION_NONE      = 1,
  SESSION_STARTED   = 2,
  SESSION_FAILED    = 3,
  SESSION_SUCCESS   = 4,
  BOX_COVERED = -3,
  BOX_MINE = -2,
  BOX_EXPLODED = -1,
  BOX_ZERO = 0
;

class MineSweeperMap {
  
  constructor() {
    this.status = SESSION_NONE;
    this.mineCount = 0;
    this.openCount = 0;
  }

  _reset() {
    this._map = [];
    this.boxes = [];
    for (let r = 0; r < this.height; r++) {
      this._map[r] = [];
      for (let c = 0; c < this.width; c++) {
        this._map[r][c] = BOX_COVERED;
        this.boxes.push([r, c]);
      }
    }
  }

  _setMines() {
    this.mineCount = Math.round(this.minPercentage * this.boxes.length);

    for (let i = 0; i < this.mineCount; i++) {
      const index = Math.floor(Math.random() * this.boxes.length);
      const [r, c] = this.boxes.splice(index, 1)[0];
      this._map[r][c] = BOX_MINE;
    }
  }

  _setNumbers() {
    this.boxes.forEach(([hintR, hintC]) => this._map[hintR][hintC] = this._countMines(hintR, hintC));
  }

  _randomMap() {
    this._reset();
    this._setMines();
    this._setNumbers();
  };

  _countMines(r, c) {
    return this._siblingBoxes(r, c).reduce((count, [r, c]) => count + (this._map[r] !== undefined && this._map[r][c] === BOX_MINE), 0);
  }

  _siblingBoxesIndexes(r, c) {
    const range = [-1, 0, 1];
    let result = [];

    range.forEach(hor => range.forEach(ver => {
        if (!(ver === 0 && hor === 0)) {
          result.push([r - hor, c - ver]);
        }
      })
    );

    return result;
  }

  _siblingBoxes(r, c) {
    return this._siblingBoxesIndexes(r, c).reduce((boxes, [r, c]) => {
      return this._map[r] !== undefined && this._isValidValue(this._map[r][c]) ? [...boxes, [r, c]] : boxes;
    }, []);
  }

  _validateMap(map) {
    if(!map.length) {
      throw new Error('MineSweeperMap expects map to have at least one row');
    }

    if(!map.every(row => row.length === map[0].length)) {
      throw new Error('MineSweeperMap expects map to same width rows');
    }

    if(!map.every(row => row.every(cell => this._isValidValue(cell)))) {
      throw new Error('MineSweeperMap expects map with all boxes having valid value');
    }

    if(!map.every((row, r) => row.every((cell, c) => {
      return cell < BOX_ZERO || cell === this._siblingBoxesIndexes(r, c)
        .reduce((count, [r,c]) => count + (map[r] !== undefined && map[r][c] === BOX_MINE), 0);
    }))) {
      throw new Error('MineSweeperMap expects map with all boxes having correct mine count');
    }
  }

  _validateArguments(width, height, minePercentage) {
    if (!Number.isInteger(width)) {
      throw new Error('MineSweeperMap expects width to be an integer');
    }

    if (!Number.isInteger(height)) {
      throw new Error('MineSweeperMap expects height to be an integer');
    }

    if (Number(minePercentage) !== minePercentage || minePercentage % 1 === 0) {
      throw new Error('MineSweeperMap expects height to be a float');
    }
  }

  _isValidValue(value) {
    return BOX_COVERED <= value && value <= 8;
  }

  // public
  open(x, y) {

    const [r, c] = [y, x];
    
    if(this.status !== SESSION_STARTED) {
      return this.status;
    }

    if(this._map[r][c] >= BOX_ZERO) {
      return this.status;
    }
    
    const openingQueue = [[r, c]];
    while (openingQueue.length) {

      const [r, c] = openingQueue.shift();

      if (this._map[r][c] === BOX_MINE) {
        this.status = SESSION_FAILED;
        this._map[r][c] = BOX_EXPLODED;
        break;
      }

      this._map[r][c] = this._countMines(r, c);
      this.openCount++;
      
      if( (this.boxes.length - this.mineCount) === this.openCount) {
        this.status = SESSION_SUCCESS;
        break;
      }

      if (this._map[r][c] === BOX_ZERO) {
        // filter only uncovered and if not already added
        this._siblingBoxes(r, c).filter(([r, c]) => this._map[r][c] === BOX_COVERED).forEach(([newR, newC]) => {
          if(!openingQueue.some(([existingR, existingC]) => existingR === newR && existingC === newC)){
            openingQueue.push([newR, newC]);
          }
        });
      }
    }
    
    return this.status;
  }

  newSession(width, height, minePercentage) {

    if (Array.isArray(width)) {
      this._validateMap(width);
      this._map = width;
      this.mineCount = this._map.reduce((count, row) => count +
        row.reduce((count, cell) => count + (cell === BOX_MINE), 0), 0);
      this.openCount = this._map.reduce((count, row) => count +
        row.reduce((count, cell) => count + (cell >= BOX_ZERO), 0), 0);
    } else {
      this._validateArguments(width, height, minePercentage);
      this.width = width;
      this.height = height;
      this.minPercentage = minePercentage;
      this._randomMap();
    }

    this.status = SESSION_STARTED;
  }

  get currentMap() {
    return this._map;
  }
}

module.exports = {
  MineSweeperMap,
  Constants: {
    SESSION_NONE,
    SESSION_STARTED,
    SESSION_FAILED,
    SESSION_SUCCESS,
    BOX_COVERED,
    BOX_MINE,
    BOX_EXPLODED,
    BOX_ZERO,
  },
};