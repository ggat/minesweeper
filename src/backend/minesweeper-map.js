const
  SESSION_NONE = 1,
  SESSION_STARTED = 2,
  SESSION_FAILED = 3,
  SESSION_SUCCESS = 4,
  BOX_COVERED = -3,
  BOX_MINE = -2,
  BOX_EXPLODED = -1,
  BOX_ZERO = 0
;

class MineSweeperMap {

  constructor() {
    this._status = SESSION_NONE;
    this._totalCount = 0;
    this._mineCount = 0;
    this._openCount = 0;
  }

  _randomMap() {
    const boxPoll = [];
    this._map = [];
    this.boxes = [];
    for (let r = 0; r < this._height; r++) {
      this._map[r] = [];
      for (let c = 0; c < this._width; c++) {
        this._map[r][c] = BOX_COVERED;
        boxPoll.push([r, c]);
      }
    }

    this._totalCount = boxPoll.length;

    // set mines
    this._mineCount = Math.round(this._minPercentage * boxPoll.length);
    for (let i = 0; i < this._mineCount; i++) {
      const index = Math.floor(Math.random() * this.boxes.length);
      const [r, c] = boxPoll.splice(index, 1)[0];
      this._map[r][c] = BOX_MINE;
    }
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
    if (!map.length) {
      throw new Error('MineSweeperMap expects map to have at least one row');
    }

    if (!map.every(row => row.length === map[0].length)) {
      throw new Error('MineSweeperMap expects map to same width rows');
    }

    if (!map.every(row => row.every(cell => this._isValidValue(cell)))) {
      throw new Error('MineSweeperMap expects map with all boxes having valid value');
    }

    if (!map.every((row, r) => row.every((cell, c) => {
      return cell < BOX_ZERO || cell === this._siblingBoxesIndexes(r, c)
        .reduce((count, [r, c]) => count + (map[r] !== undefined && map[r][c] === BOX_MINE), 0);
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

  _uncover(r, c) {
    this._map[r][c] = this._countMines(r, c);
    this._openCount++;
  }

  _isMine(r, c) {
    return this._map[r][c] === BOX_MINE;
  }

  _isZero(r, c) {
    return this._map[r][c] === BOX_ZERO;
  }

  _isCovered(r, c) {
    return this._map[r][c] === BOX_COVERED;
  }

  _isEqual(boxA, boxB) {
    return boxA[0] === boxB[0] && boxA[1] === boxB[1];
  }

  _isFinished() {
    return (this._totalCount - this._mineCount) === this._openCount;
  }

  // public
  open(x, y) {

    // todo: handle case when x, y is out of bounds
    const [r, c] = [y, x];

    if (this._status !== SESSION_STARTED) {
      return this._status;
    }

    // todo: replace this with !_isCovered
    if (this._map[r][c] >= BOX_ZERO) {
      return this._status;
    }

    const openingQueue = [[r, c]];
    while (openingQueue.length) {

      const [r, c] = openingQueue.shift();

      if (this._isMine(r, c)) {
        this._status = SESSION_FAILED;
        this._map[r][c] = BOX_EXPLODED;
        break;
      }

      this._uncover(r, c);

      if (this._isFinished()) {
        this._status = SESSION_SUCCESS;
        break;
      }

      if (this._isZero(r, c)) {
        this._siblingBoxes(r, c)
          .filter((box) => this._isCovered(...box))
          .forEach((newBox) => {
            if (!openingQueue.some((existingBox) => this._isEqual(existingBox, newBox))) {
              openingQueue.push(newBox);
            }
          });
      }
    }

    return this._status;
  }

  newSession(width, height, minePercentage) {

    if (Array.isArray(width)) {
      this._validateMap(width);
      this._map = width.map(row => [...row]);
      this._totalCount = this._map.length * this._map[0].length;
      this._mineCount = this._map.reduce((count, row) => count +
        row.reduce((count, cell) => count + (cell === BOX_MINE), 0), 0);
      this._openCount = this._map.reduce((count, row) => count +
        row.reduce((count, cell) => count + (cell >= BOX_ZERO), 0), 0);
    } else {
      this._validateArguments(width, height, minePercentage);
      this._width = width;
      this._height = height;
      this._minPercentage = minePercentage;
      this._randomMap();
    }

    this._status = SESSION_STARTED;
  }

  get currentSecretMap() {
    return this._map;
  }

  get currentMap() {
    return this._map.map(row => row.map(cell => cell === BOX_MINE ? BOX_COVERED : cell));
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