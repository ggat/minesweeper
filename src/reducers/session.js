const sessionReducer = (state, action) => {

  switch (action.type) {
    case 'SET_MAP':
      return {...state, map: action.map};
    case 'SET_SOLVER_RESULT':
      const [frees, mines, candidates, descriptors] = action.result;
      return {...state, frees, mines, candidates, descriptors};
    case 'SET_PROGRESS':
      return {...state, progress: action.progress};
    case 'SET_OPENING':
      return {...state, opening: action.opening};
    default:
      return state || {
        map: [[]],
        frees: [],
        mines: [],
        candidates: [],
        descriptors: [],
        progress: {
          current: 0,
          total: 0
        },
        opening: {
          current: 0,
          total: 0
        },
      };
  }
};

export default sessionReducer;

export const getMap = state => state.session.map;
export const getFrees = state => state.session.frees;
export const getMines = state => state.session.mines;
export const getCandidates = state => state.session.candidates;
export const getDescriptors = state => state.session.descriptors;
export const getProgress = state => state.session.progress;
export const getOpening = state => state.session.opening;

export const getMineCount = state => state.session.mines.length;