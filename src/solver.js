const U = -1;

function MineSweeper(map) {
  this.map = map;
  this.mines = [];

  // create initial map to keep flags on mines
  this.forEach((value, r, c) => {
    this.mines[r] = this.mines[r] || [];
    this.mines[r][c] = false;
  });

  // create keys for easier access to the boxes
  this.createKeys();
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

MineSweeper.prototype.createKeys = function () {
  this.keys = [];
  this.indexes = {};

  for (let r = 0; r < this.map.length; r++) {
    this.keys[r] = [];
    for (let c = 0; c < this.map[r].length; c++) {
      this.keys[r][c] = r + '' + c;
      this.indexes[this.keys[r][c]] = [r, c];
    }
  }
};


MineSweeper.prototype.createEquations = function () {
  const equationsByBox = {},
        frees = [];

  // create equation and maybe find free boxes and mines
  this.forEach((value, r, c) => {
    let coveredSiblings;
    if (value !== U && !this.mines[r][c] && (coveredSiblings = this.coveredSiblings(r,c)).length) {

      let sum = value - this.minedSiblings(r, c).length;

      if(sum === 0) {
        console.log('not here');
        // all covered siblings are free
        frees.push(r,c);
      } else if(sum === coveredSiblings.length) {

        // todo: this can be improved
        coveredSiblings.forEach(([r, c]) => {

          if (!this.mines[r][c]) {
            // set flag to indicate mined box
            this.mines[r][c] = true;

            // if there is any equation that includes this box. We need to correct these.
            while(equationsByBox[this.keys[r][c]].length) {
              const affectedEquation = equationsByBox[this.keys[r][c]].pop();

              // remove mine from equation, mutating original eq
              this.removeMineFromEquation(affectedEquation, r, c);
            }
          }
        });

        console.log('not even here');
        // covered siblings are mines
      } else {
        console.log('we need to expand');
        // we need to consider sibling's equations to see if we can isolate value for current box

      }

      const equation = [coveredSiblings, sum];

      // associate this equation to all boxes it includes
      for (let i = 0; i < coveredSiblings.length; i++) {
        const key = coveredSiblings[i][0] + '' + coveredSiblings[i][1];
        equationsByBox[key] = equationsByBox[key] || [];
        equationsByBox[key].push(equation);
      }
    }
  });

  if(!frees.length) {
    // we were not able to find free boxes so far, lets consider multiple boxes at once, to increase chances.
    for (let [boxKey, ownEquations] of Object.entries(equationsByBox)) {
      const [boxR, boxC] = this.indexes[boxKey];

      const siblingsEquations = this.siblings(boxR, boxC).map(([r,c]) => {
        return this.keys[r] && this.keys[r][c] && equationsByBox[this.keys[r][c]];
      }).filter(eq => eq !== undefined);

      for (let i = 0; i < siblingsEquations.length; i++) {

        // equations of particular sibling
        const equations = siblingsEquations[i];

        for (let j = 0; j < equations.length; j++) {
          // sibling's specific equation
          const equation = equations[j];

          for (let k = 0; k < ownEquations.length; k++) {
            const ownEquation = ownEquations[k];

            // console.log('own equation ', boxKey, ownEquation)

            // we can isolate value for this box from equations by finding equation in sibling
            // boxes that does not include this box and includes all other boxes in current ownEquation
            if((ownEquation[0].length - equation[0].length) === 1) {
              // console.log('equations ', ownEquation, equation);

              const allMembersIncluded = equation[0].every(member1 => ownEquation[0].some(member2 => {
                const [key1, key2] = [this.keys[member1[0]][member1[1]], this.keys[member2[0]][member2[1]]];

                return (key1 === key2) && key2 !== this.keys[boxR][boxC];
              }));

              if(allMembersIncluded) {
                const isolatedValue = ownEquation[1] - equation[1];

                if(isolatedValue === 0) {
                  frees.push([boxR, boxC])
                }


                // console.log('isolated value', boxKey, isolatedValue, equation[0], ownEquation[0]);
                //
                // // reduce all equations that included this value
                // ownEquations.forEach(reducibleEquation => {
                //   this.removeMemberFromEquation(reducibleEquation, boxR, boxC, isolatedValue);
                //
                //   if(reducibleEquation[0].length === 1 && reducibleEquation[1] === 0) {
                //     frees.push([...reducibleEquation[0][0]])
                //     console.log('isolate value after', reducibleEquation[0][0], reducibleEquation[1])
                //   }
                // });
              }
            }
          }
        }
      }
    }
  }

  console.log('frees', frees)

  // console.log('equations', JSON.stringify(equations));
  //
  // return equations;
};

MineSweeper.prototype.removeMineFromEquation = function(eq, r, c) {
  this.removeMemberFromEquation(eq, r, c, 1);
};

MineSweeper.prototype.removeMemberFromEquation = function(eq, r, c, v) {

  for (let m = 0; m < eq[0].length; m++) {
    console.log('for')
    if(eq[0][m][0] === r && eq[0][m][1] === c) {

      // once found remove it
      eq[0].splice(m, 1);

      // because we remove member from equation, we also need to correct right hand side
      eq[1] = eq[1] - v;
    }
  }
};

MineSweeper.prototype.step = function () {
  const candidates = this.findCandidates();
  const frees = [];

  this.createEquations();

  /*
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

    console.log('new sums length', sums.length)

    sums = sums.concat(newSums);

    //TODO: remove limit
    u++;
  }
*/
  return [frees, this.mines, candidates];
};

MineSweeper.prototype.randomCandidateBox = function () {
  const boxes = this.findCandidateBoxes();

  return boxes[Math.round(Math.random() * (boxes.length -1))];
};

// export const Solver = MineSweeper;

// export default (map) => {
//   return new MineSweeper(map).step();
// };

const map = [
  [1, U],
  [1, U],
  [2, U],
  [1, U],
];

console.log(new MineSweeper(map).step())