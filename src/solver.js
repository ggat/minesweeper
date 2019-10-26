const
  U = -1,
  M = -2,
  F = -3;
;

function MineSweeper(map) {
  this.updateMap(map);
}

MineSweeper.prototype.updateMap = function (map) {
  this.map = map;
  this.mines = [];

  // create initial map to keep flags on mines
  for (let r = 0; r < this.map.length; r++) {
    this.mines[r] = [];
    for (let c = 0; c < this.map.length; c++) {
      this.mines[r][c] = false;
    }
  }
};

MineSweeper.prototype.step = function () {

}

function Box(map, mines, r, c) {
  this.map = map;
  this.mines = mines;
  this.r = r;
  this.c = c;
}

Box.prototype.siblings = function () {
  const range = [-1, 0, 1];
  const result = [];

  range.forEach(hor => range.forEach(ver => {
      if (!(ver === hor && hor === 0)) {
        result.push([this.r - hor, this.c - ver]);
      }
    })
  );

  return result;
};

Box.prototype.uncoveredSiblings = function () {

  const sibs = this.siblings();
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

Box.prototype.coveredSiblings = function () {
  const sibs = this.siblings();
  const result = [];

  for (let s = 0; s < sibs.length; s++) {
    const [hor, ver] = sibs[s];
    const sibling = this.map[hor] && this.map[hor][ver];

    if (sibling === U) {
      result.push([hor, ver, sibling]);
    }
  }

  return result;
};

Box.prototype.minedSiblings = function () {
  const sibs = this.siblings();
  const result = [];

  for (let s = 0; s < sibs.length; s++) {
    const [hor, ver] = sibs[s];
    const sibling = this.map[hor] && this.map[hor][ver];

    if (this.mines[hor] && this.mines[hor][ver]) {
      result.push([hor, ver, sibling]);
    }
  }

  return result;
}

Box.prototype.isCovered = function () {
  return this.map[this.r][this.c] === U;
};

Box.prototype.value = function () {
  return this.map[this.r][this.c];
};

Box.prototype.valueOf = function () {
  return `Box(${this.r},${this.c})`;
};

// module.exports = findFree;

export default findFree;

function findFree(map) {

  /*const table = [
    [0, 1, U, U],
    [0, 1, U, U],
    [2, 4, U, U],
    [U, U, U, U],
    [U, U, U, U],
  ];*/

  // const table = [
  //   [0, U, U, U],
  //   [0, 0, U, U],
  //   [U, U, U, U],
  //   [U, U, U, U],
  //   [U, U, U, U],
  // ];

  const table = map;

  const mines = [];

  // create initial map to keep flags on mines
  for (let r = 0; r < table.length; r++) {
    mines[r] = [];
    for (let c = 0; c < table.length; c++) {
      mines[r][c] = false;
    }
  }

  function siblings(r, c) {
    const range = [-1, 0, 1];
    const result = [];

    range.forEach(hor => range.forEach(ver => {
        if (!(ver === 0 && hor === 0)) {
          result.push([r - hor, c - ver]);
        }
      })
    );

    return result;
  }

  function findCandidates() {
    const candidates = [];

    for (let r = 0; r < table.length; r++) {
      for (let c = 0; c < table.length; c++) {
        // const box = new Box(table, mines, r, c);
        const uncovered = uncoveredSiblings(r, c);
        if (table[r][c] === U && uncovered.length) {
          candidates.push([r, c, uncovered]);
        }
      }
    }

    return candidates;
  }

  function uncoveredSiblings(r, c) {

    const sibs = siblings(r, c);
    const result = [];

    for (let s = 0; s < sibs.length; s++) {
      const [hor, ver] = sibs[s];
      const sibling = table[hor] && table[hor][ver];

      if (sibling !== undefined && sibling !== U) {
        result.push([hor, ver, sibling]);
      }
    }

    return result;
  }

  function coveredSiblings(r, c) {
    const sibs = siblings(r, c);
    const result = [];

    for (let s = 0; s < sibs.length; s++) {
      const [hor, ver] = sibs[s];
      const sibling = table[hor] && table[hor][ver];

      if (sibling === U && !mines[hor][ver]) {
        result.push([hor, ver, sibling]);
      }
    }

    return result;
  }

  function minedSiblings(r, c) {
    const sibs = siblings(r, c);
    const result = [];

    for (let s = 0; s < sibs.length; s++) {
      const [hor, ver] = sibs[s];
      const sibling = table[hor] && table[hor][ver];

      if (mines[hor] && mines[hor][ver]) {
        result.push([hor, ver, sibling]);
      }
    }

    return result;
  }

  function findCertain() {
    const candidates = findCandidates();

    const certains = [];

    const maxIterations = 2;
    let u = 0;
    while (!certains.length && u < maxIterations) {

      const sums = [];

      candidates.forEach((candidate) => {
        // candidate.uncoveredSiblings().forEach(box => {
        //
        // });
        candidate[2].forEach(([r, c, value]) => {
          const minedSibs = minedSiblings(r, c);
          const coveredSibs = coveredSiblings(r, c);

          let sum = value - minedSibs.length;

          if(sum === 0) {

            coveredSibs.forEach(covered => {
              if (!containsBox(certains, covered) && !mines[covered[0]][covered[1]]) {
                certains.push(covered);
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
            if (!mines[r][c]) {
              foundMines = true;
              mines[r][c] = true;
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

            // save certainly free box
            if (subtracted.length === 1 && subSum === 0) {

              if (!containsBox(certains, subtracted[0]) && !mines[subtracted[0][0]][subtracted[0][1]]) {
                certains.push(subtracted[0]);
              }
            }
          }
        }
      }

      sums.push(...newSums);

      u++;
    }

    return [certains, mines, candidates];
  }

  return findCertain();
}

function containsBox(boxes, box) {
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i][0] === box[0] && boxes[i][1] === box[1]) {
      return true;
    }
  }

  return false;
}

function subtractEquation(eq1, eq2) {

  const leftOver = [];

  for (let i = 0; i < eq1[0].length; i++) {
    let found = false;
    const member1 = eq1[0][i];
    for (let j = 0; j < eq2[0].length; j++) {
      const member2 = eq2[0][j];

      if (member1[0] === member2[0] && member1[1] === member2[1]) {
        found = true;
      }
    }

    if (!found) {
      leftOver.push(member1);
    }
  }

  return [leftOver, eq1[1] - eq2[1]];
}

function tableToString(table) {
  const result = [];
  for (let r = 0; r < table.length; r++) {
    result[r] = [];
    for (let c = 0; c < table[r].length; c++) {
      if (table[r][c] === M) {
        result[r][c] = 'M';
      } else if (table[r][c] === U) {
        result[r][c] = 'U';
      } else {
        result[r][c] = '' + table[r][c];
      }
    }
  }

  return result;
}