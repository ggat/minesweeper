import React from "react";
import {connect} from 'react-redux';
import {getProgress} from "../../reducers/session";
import StatProgress from "../stat-progress/StatProgress";
import "../stat-progress/StatProgress.scss";

function StatLeft(props) {
  return <StatProgress current={props.current} total={props.total} name="Left"/>;
}

const stateToProps = state => getProgress(state);

export default connect(stateToProps)(StatLeft);