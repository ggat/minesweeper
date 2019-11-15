import React from "react";
import {connect} from "react-redux";
import './LevelButton.scss'
import * as gameSelectors from "../../reducers/game";
import {setActiveLevel, setLevelResult} from "../../actions/game";

class LevelButton extends React.Component {

  otherSessionStarted() {
    return this.props.activeLevel !== null && this.props.activeLevel !== this.props.lvl;
  }

  isActive() {
    return this.props.activeLevel === this.props.lvl;
  }

  render() {
    const {lvl} = this.props;
    return (
      <div className="input-group mb-3 mr-sm-3 LvlButton">
        <div className="input-group-prepend">
          <button onClick={this.props.onClick} key={lvl} disabled={this.otherSessionStarted(lvl)}
                  className={`btn ${this.isActive(lvl) ? 'btn-success' : 'btn-primary' }`}>Start level {lvl}</button>
        </div>
        <input type="text" className="form-control" readOnly value={this.props.sessionResults[lvl] || 'Not finished yet'}/>
      </div>
    );
  }
}

const stateToProps = state => ({
  sessionResults: gameSelectors.getSessionResults(state),
  activeLevel: gameSelectors.getActiveLevel(state),
});

const dispatchToProps = dispatch => ({
  setLevelResult: (level, result) => dispatch(setLevelResult(level, result)),
  setActiveLevel: level => dispatch(setActiveLevel(level))
});

export default connect(stateToProps, dispatchToProps)(LevelButton);