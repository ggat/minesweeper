const {assert} = require('chai');
const MineSweeperMap = require('../../src/backend/minesweeper-map');

describe('MineSweeperMap', function () {

  it('throws error if incorrect parameters passed', function () {
    assert.throws(() => new MineSweeperMap(), Error);
    assert.throws(() => new MineSweeperMap(5), Error);
    assert.throws(() => new MineSweeperMap(5, 5), Error);
    assert.throws(() => new MineSweeperMap(5.1, 5), Error);
    assert.throws(() => new MineSweeperMap(5, 5.1), Error);
    assert.throws(() => new MineSweeperMap(5, 5, 1), Error);
  });

  it('generates two dimensional map', function() {
    const
      width = 10,
      height = 10,
      percentage = 0.2;

    let mapGenerator = new MineSweeperMap(width, height, percentage);
    const map = mapGenerator.generateMap();

    assert(Array.isArray(map));
    assert(map.length === height);

    map.forEach(row => {
      assert(Array.isArray(row));
      assert(row.length === width);
    });
  });

  it('spreads correct number of mines', function() {

    const
      width = 10,
      height = 10,
      percentage = 0.2;

    let mapGenerator = new MineSweeperMap(width, height, percentage);
    const map = mapGenerator.generateMap();

    const expectedCount = Math.round(width * height * 0.2);
    const actualCount = map.reduce((count, row) => count + row.reduce((count, cell) => count + (cell === -1), 0), 0);

    assert(expectedCount === actualCount);
  });
});