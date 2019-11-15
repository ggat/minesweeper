const setLevelResult = (level, result) => ({
  type: 'SET_LEVEL_RESULT',
  level,
  result
});

const setActiveLevel = (level) => ({
  type: 'SET_ACTIVE_LEVEL',
  level
});

export {setLevelResult, setActiveLevel};