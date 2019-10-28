const U = -1;

function MineSweeper(map) {
  this.map = map;
  this.mines = [];

  // create initial map to keep flags on mines
  this.forEach((value, r, c) => {
    this.mines[r] = this.mines[r] || [];
    this.mines[r][c] = false;
  });
}

MineSweeper.prototype.siblings = function (r, c) {
  const range = [-1, 0, 1];
  const result = [];

  range.forEach(hor => range.forEach(ver => {
      if (!(ver === 0 && hor === 0)) {
        result.push([r - hor, c - ver]);
      }
    })
  );

  return result;
};

MineSweeper.prototype.forEach = function(callback) {
  for (let r = 0; r < this.map.length; r++) {
    for (let c = 0; c < this.map[r].length; c++) {
      callback(this.map[r][c], r, c);
    }
  }
};

/**
 * Finds candidates that are covered and have at least one uncovered sibling
 *
 * @returns {[]}
 */
MineSweeper.prototype.findCandidates = function () {
  const candidates = [];

  this.forEach((value, r, c) => {
    const uncovered = this.uncoveredSiblings(r, c);
    if (value === U && uncovered.length) {
      candidates.push([r, c, uncovered]);
    }
  });

  return candidates;
};

/**
 * Finds candidates that are covered and are not known to be mines
 *
 * @returns {[]}
 */
MineSweeper.prototype.findCandidateBoxes = function () {
  const candidates = [];

  this.forEach((value, r, c) => {
    if (value === U && !this.mines[r][c]) {
      candidates.push([r, c]);
    }
  });

  return candidates;
};

MineSweeper.prototype.uncoveredSiblings = function (r, c) {
  const sibs = this.siblings(r, c);
  const result = [];

  for (let s = 0; s < sibs.length; s++) {
    const [hor, ver] = sibs[s];
    const sibling = this.map[hor] && this.map[hor][ver];

    if (sibling !== undefined && sibling !== U) {
      result.push([hor, ver, sibling]);
    }
  }

  return result;
};

MineSweeper.prototype.coveredSiblings = function (r, c) {
  const sibs = this.siblings(r, c);
  const result = [];

  for (let s = 0; s < sibs.length; s++) {
    const [hor, ver] = sibs[s];
    const sibling = this.map[hor] && this.map[hor][ver];

    if (sibling === U && !this.mines[hor][ver]) {
      result.push([hor, ver, sibling]);
    }
  }

  return result;
};

MineSweeper.prototype.minedSiblings = function (r, c) {
  const sibs = this.siblings(r, c);
  const result = [];

  for (let s = 0; s < sibs.length; s++) {
    const [hor, ver] = sibs[s];
    const sibling = this.map[hor] && this.map[hor][ver];

    if (this.mines[hor] && this.mines[hor][ver]) {
      result.push([hor, ver, sibling]);
    }
  }

  return result;
};

MineSweeper.prototype.containsBox = function (boxes, box) {
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i][0] === box[0] && boxes[i][1] === box[1]) {
      return true;
    }
  }

  return false;
};

MineSweeper.prototype.step = function () {
  const candidates = this.findCandidates();
  const frees = [];

  const maxIterations = 4;
  let u = 0;
  while (!frees.length && u < maxIterations) {

    let sums = [];

    candidates.forEach((candidate) => {
      candidate[2].forEach(([r, c, value]) => {
        const minedSibs = this.minedSiblings(r, c);
        const coveredSibs = this.coveredSiblings(r, c);

        let sum = value - minedSibs.length;

        if (sum === 0) {

          coveredSibs.forEach(covered => {
            if (!this.containsBox(frees, covered) && !this.mines[covered[0]][covered[1]]) {
              frees.push(covered);
            }
          })
        }

        sums.push([coveredSibs, value - minedSibs.length]);
      });
    });

    // if we could not find mines then we should be able to find free box
    sums.sort((a, b) => b[0].length - a[0].length);

    let foundMines = false;
    // consider on every iteration we either find mines or certain free box
    for (let i = 0; i < sums.length; i++) {
      const sum = sums[i];

      if (sum[0].length === sum[1]) {
        // all members are mines
        sum[0].forEach(([r, c]) => {
          // todo: this can be improved
          if (!this.mines[r][c]) {
            foundMines = true;
            this.mines[r][c] = true;
          }
        });
      }
    }

    if (foundMines) {
      continue;
    }

    const newSums = [];
    for (let i = 0; i < sums.length; i++) {
      for (let j = 0; j < sums.length; j++) {

        if (i !== j) {

          let subtracted = sums[i][0].filter(n => !sums[j][0].includes(n));
          const subSum = sums[i][1] - sums[j][1];

          newSums.push([subtracted, subSum]);

          // save certainly free box
          if (subtracted.length === 1 && subSum === 0) {

            if (!this.containsBox(frees, subtracted[0]) && !this.mines[subtracted[0][0]][subtracted[0][1]]) {
              frees.push(subtracted[0]);
            }
          }
        }
      }
    }

    sums = sums.concat(newSums);

    //TODO: remove limit
    u++;
  }

  return [frees, this.mines, candidates];
};

MineSweeper.prototype.randomCandidateBox = function () {
  const boxes = this.findCandidateBoxes();

  return boxes[Math.round(Math.random() * (boxes.length -1))];
};

export const Solver = MineSweeper;

export default (map) => {
  return new MineSweeper(map).step();
};