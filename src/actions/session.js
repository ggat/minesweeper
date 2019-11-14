const setMap = (map) => ({
  type: 'SET_MAP',
  map
});

const setSolverResult = (result) => ({
  type: 'SET_SOLVER_RESULT',
  result
});

const setProgress = (progress) => ({
  type: 'SET_PROGRESS',
  progress
});

const setOpening = (opening) => ({
  type: 'SET_OPENING',
  opening
});

export {setMap, setSolverResult, setProgress, setOpening};