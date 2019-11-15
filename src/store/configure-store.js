import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from "redux-thunk";
import sessionReducer from "../reducers/session";
import gameReducer from "../reducers/game";

const reducers = {
  game: gameReducer,
  session: sessionReducer
};

export default () => {
  return createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
  );
}