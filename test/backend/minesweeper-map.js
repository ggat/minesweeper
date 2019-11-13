const {assert, expect} = require('chai');
const {
  MineSweeperMap,
  Constants: {
    BOX_MINE: M,
    BOX_COVERED: C,
    BOX_EXPLODED: E,
    SESSION_STARTED,
    SESSION_FAILED,
    SESSION_SUCCESS,
  }
} = require('../../src/backend/minesweeper-map');

describe('MineSweeperMap', function () {

  const sampleMap = [
    [C, C, C, C, C],
    [C, C, C, C, C],
    [C, M, C, C, C],
    [C, C, C, C, C],
    [C, C, C, C, C],
    [C, C, C, C, C],
    [C, C, C, M, M],
  ];
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
    const map = mapGenerator.currentSecretMap;

    const expectedCount = Math.round(width * height * 0.2);
    const actualCount = map.reduce((count, row) =>
      count + row.reduce((count, cell) => count + (cell === M), 0), 0);

    expect(actualCount).to.eq(expectedCount);
  });

  it('recursively opens zeros', function () {

    const expected = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [C, C, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 2, 2],
      [0, 0, 1, C, C]
    ];

    mapGenerator.newSession(sampleMap);
    mapGenerator.open(0, 0);

    expect(mapGenerator.currentMap).to.eql(expected);
  });

  it('it should return "failed" status when mine opened', function () {

    const expected = [
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, E, C, C, C],
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, C, C, C, C],
      [C, C, C, C, C],
    ];

    mapGenerator.newSession(sampleMap);
    const status = mapGenerator.open(1, 2);

    expect(status).to.eq(SESSION_FAILED);
    expect(mapGenerator.currentMap).to.eql(expected);
  });

  it('it should return "started" status after open if not finished', function() {
    let status;

    mapGenerator.newSession(sampleMap);

    status = mapGenerator.open(0, 0);
    expect(status).to.eq(SESSION_STARTED);

    status = mapGenerator.open(0, 1);
    expect(status).to.eq(SESSION_STARTED);

    status = mapGenerator.open(2, 6);
    expect(status).to.eq(SESSION_STARTED);
  });

  it('it should return "success" status after open if every free box is open', function() {
    expect(mapGenerator.open(0, 2)).to.eq(SESSION_SUCCESS);
  })


});