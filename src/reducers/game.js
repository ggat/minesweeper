const gameReducer = (state, action) => {

  switch (action.type) {
    case 'SET_LEVEL_RESULT':
      const sessionResults = {...state.sessionResults};
      sessionResults[action.level] = action.result;

      return {
        ...state,
        sessionResults
      };
    case 'SET_ACTIVE_LEVEL':
      return {
        ...state,
        activeLevel: action.level
      };
    default:
      return state || {
        sessionResults: {},
        activeLevel: null
      };
  }
};

export default gameReducer;

export const getSessionResults = state => state.game.sessionResults;
export const getActiveLevel = state => state.game.activeLevel;

