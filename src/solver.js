const U = -1;

function MineSweeper(map) {
  this.map = map;
  this.mines = [];
  this.frees = [];
  this.candidates = [];
  this.freesFound = false;
  this.equationsByBox = {};

  // create initial map to keep flags on mines
  this.forEach((value, r, c) => {
    this.mines[r] = this.mines[r] || [];
    this.mines[r][c] = false;
  });

  this.forEach((value, r, c) => {
    this.frees[r] = this.frees[r] || [];
    this.frees[r][c] = false;
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

MineSweeper.prototype.forEach = function (callback) {
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

MineSweeper.prototype.createKeys = function () {
  this.keys = [];
  this.indexes = {};

  for (let r = 0; r < this.map.length; r++) {
    this.keys[r] = [];
    for (let c = 0; c < this.map[r].length; c++) {
      this.keys[r][c] = r + 'x' + c;
      this.indexes[this.keys[r][c]] = [r, c];
    }
  }
};

MineSweeper.prototype.detectFreeOrMine = function (eq) {
  if (eq[1] === 0) {
    for (let i = 0; i < eq[0].length; i++) {
      const [r, c] = this.indexes[eq[0][i]];
      this.frees[r][c] = true;
      this.freesFound = true;
    }
  } else if (eq[1] === eq[0].length) {
    for (let i = 0; i < eq[0].length; i++) {
      const [r, c] = this.indexes[eq[0][i]];
      this.mines[r][c] = true;
    }
  }
};


MineSweeper.prototype.step = function () {

  // create equations and maybe find free boxes and mines
  this.forEach((value, r, c) => {
    let coveredSiblings;
    if (value !== U && !this.mines[r][c] && (coveredSiblings = this.coveredSiblings(r, c)).length) {

      const sum = value - this.minedSiblings(r, c).length;
      const equation = [coveredSiblings.map(box => this.keys[box[0]][box[1]]), sum];

      this.addEquation(equation);
    }
  });

  if (!this.freesFound) {

    // we were not able to find free boxes so far, lets consider multiple boxes at once, to increase chances.
    for (let [boxKey, ownEquations] of Object.entries(this.equationsByBox)) {

      const [boxR, boxC] = this.indexes[boxKey];

      const siblingsEquations = this.siblings(boxR, boxC).map(([r, c]) => {
        return this.keys[r] && this.keys[r][c] && this.equationsByBox[this.keys[r][c]];
      }).filter(eq => eq !== undefined);


      // if free or mine skip
      if (this.frees[boxR][boxC] || this.mines[boxR][boxC]) {
        continue;
      }

      for (let i = 0; i < siblingsEquations.length; i++) {

        // equations of particular sibling
        const equations = siblingsEquations[i];

        for (let j = 0; j < equations.length; j++) {
          // sibling's specific equation
          const equation = equations[j];

          // if sibling's equation includes this box skip
          if (equation[0].indexOf(boxKey) !== -1) {
            continue;
          }

          for (let k = 0; k < ownEquations.length; k++) {
            const ownEquation = ownEquations[k];

            // if all members are of sibling's equation are in included in current ownEquation
            //  we can create new narrower equation
            let narrowEquation = this.tryNarrowEquation(ownEquation, equation);
            if (narrowEquation) {
              this.addEquation(narrowEquation);
            }
          }
        }
      }
    }
  }

  return this.results();
};

MineSweeper.prototype.results = function () {
  const
    candidates = this.candidates = this.findCandidates(),
    frees = [],
    mines = [];

  this.forEach((v, r, c) => {
    if (this.frees[r][c]) {
      frees.push([r, c]);
    } else if (this.mines[r][c]) {
      mines.push([r, c]);
    }
  });

  return [frees, mines, candidates];
};

MineSweeper.prototype.tryNarrowEquation = function (eq1, eq2) {
  let result = null;

  if (this.includesAllMembers(eq1[0], eq2[0])) {
    result = [[], eq1[1] - eq2[1]];
    for (let l = 0; l < eq1[0].length; l++) {
      if (eq2[0].indexOf(eq1[0][l]) === -1) {
        result[0].push(eq1[0][l]);
      }
    }
  }

  return result;
};

MineSweeper.prototype.addEquation = function (eq) {

  if (!this.hasEquation(eq)) {
    // newEquationFound = true;
    this.detectFreeOrMine(eq);

    // associate this equation to all boxes it includes
    for (let i = 0; i < eq[0].length; i++) {
      const key = eq[0][i];
      this.equationsByBox[key] = this.equationsByBox[key] || [];
      this.equationsByBox[key].push(eq);

      // try to create new equations based on this new knowledge
      for (let j = 0; j < this.equationsByBox[key].length; j++) {
        if (eq !== this.equationsByBox[key][j]) {
          const narrowEquation = this.tryNarrowEquation(this.equationsByBox[key][j], eq);

          if (narrowEquation) {
            this.addEquation(narrowEquation);
          }
        }
      }
    }
  }
};

MineSweeper.prototype.hasEquation = function (eq) {

  // if any box from this equation has it associated, it means this equation is known
  const boxEquations = this.equationsByBox[eq[0][0]];

  for (let i = 0; boxEquations && i < boxEquations.length; i++) {
    if (boxEquations[i][0].length === eq[0].length && this.includesAllMembers(boxEquations[i][0], eq[0])) {
      return true;
    }
  }

  return false;
};

MineSweeper.prototype.includesAllMembers = function (arr1, arr2) {
  return arr2.every(member1 => arr1.some(member2 => member1 === member2));
};

MineSweeper.prototype.randomCandidateBox = function () {
  const boxes = this.findCandidateBoxes();

  const corners = [
    [0,0],
    [0, this.map[0].length -1],
    [this.map.length -1, 0],
    [this.map.length -1, this.map[0].length -1],
  ];

  // if any corner is not open prioritize it's opening
  for (let i = 0; i < corners.length; i++) {
    const [r, c] = corners[i];

    if(this.map[r][c] === U && !this.frees[r][c] && !this.mines[r][c]) {
      return corners[i];
    }
  }

  return boxes[Math.round(Math.random() * (boxes.length - 1))];
};

export const Solver = MineSweeper;

export default (map) => {
  return new MineSweeper(map).step();
};