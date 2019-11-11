const {assert} = require('chai');
const {
  MineSweeperMap,
  Constants: {
    BOX_MINE: M,
    BOX_COVERED: C
  }
} = require('../../src/backend/minesweeper-map');

describe('MineSweeperMap', function () {

  let mapGenerator = new MineSweeperMap();

  it('throws error if incorrect parameters passed', function () {
    assert.throws(() => mapGenerator.newSession(), Error);
    assert.throws(() => mapGenerator.newSession(5), Error);
    assert.throws(() => mapGenerator.newSession(5, 5), Error);
    assert.throws(() => mapGenerator.newSession(5.1, 5), Error);
    assert.throws(() => mapGenerator.newSession(5, 5.1), Error);
    assert.throws(() => mapGenerator.newSession(5, 5, 1), Error);
  });

  it('throws error if invalid map passed', function () {
    let map = [];
    assert.throws(() => mapGenerator.newSession(map), 'expects map to have at least one row');

    map = [
      [1, 1, 1],
      [1, -1, 1],
      [1, 1],
    ];
    assert.throws(() => mapGenerator.newSession(map), 'expects map to same width rows');

    map = [
      [1, 1, C],
      [1, M, 1],
      [1, 50, 10],
    ];
    assert.throws(() => mapGenerator.newSession(map), 'expects map with all boxes having valid value');

    map = [
      [1, 1, C],
      [C, M, 1],
      [1, 2, 1],
    ];
    assert.throws(() => mapGenerator.newSession(map), 'expects map with all boxes having correct mine count');
  });

  it('generates two dimensional map', function () {
    const
      width = 10,
      height = 10,
      percentage = 0.2;

    mapGenerator.newSession(width, height, percentage);
    const map = mapGenerator.currentMap;

    assert(Array.isArray(map));
    assert(map.length === height);

    map.forEach(row => {
      assert(Array.isArray(row));
      assert(row.length === width);
    });
  });

  it('spreads correct number of mines', function () {

    const
      width = 10,
      height = 10,
      percentage = 0.2;

    mapGenerator.newSession(width, height, percentage);
    const map = mapGenerator.currentMap;

    const expectedCount = Math.round(width * height * 0.2);
    const actualCount = map.reduce((count, row) =>
      count + row.reduce((count, cell) => count + (cell === M), 0), 0);

    assert(expectedCount === actualCount);
  });

  it('recursively opens zeros', function () {
    const map = [
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, M, C, C, C],
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, C, C, M, M],
    ];

    const expectedOpenedMap = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [C, M, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 2, 2],
      [0, 0, 1, M, M]
    ];

    mapGenerator.newSession(map);
    mapGenerator.open(0, 0);

    for (let r = 0; r < expectedOpenedMap.length; r++) {
      for (let c = 0; c < expectedOpenedMap[r].length; c++) {
        assert(expectedOpenedMap[r][c] === mapGenerator.currentMap[r][c]);
      }
    }
  })
});