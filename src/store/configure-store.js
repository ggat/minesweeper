import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from "redux-thunk";
import sessionReducer from "../reducers/session";

const reducers = {
  session: sessionReducer
};

export default () => {
  return createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
  );
}