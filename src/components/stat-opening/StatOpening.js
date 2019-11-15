import React from "react";
import {connect} from 'react-redux';
import {getOpening} from "../../reducers/session";
import StatProgress from "../stat-progress/StatProgress";
import "../stat-progress/StatProgress.scss";

function StatOpening(props) {
  return <StatProgress current={props.current} total={props.total} name="Left"/>;
}

const stateToProps = state => getOpening(state);

export default connect(stateToProps)(StatOpening);