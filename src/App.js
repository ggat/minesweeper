import React, {Component} from 'react';
import {connect} from "react-redux";
import Protocol from "./protocol";
import solve from './solver'
import * as sessionSelectors from "./reducers/session";
import * as gameSelectors from "./reducers/game";
import {setMap, setSolverResult, setProgress, setOpening} from "./actions/session";
import {setActiveLevel, setLevelResult} from "./actions/game";
import MapWithPlaceholder from "./components/map/MapWithPlaceholder";
import Levels from "./components/controls/Levels";
import Stat from "./components/stat/Stat";
import StatLeft from "./components/stat-left/StatLeft";
import StatOpening from "./components/stat-opening/StatOpening";
import './App.scss';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pause: false,
    };

    this.protocol = new Protocol("ws://hometask.eg1236.com/game1/");
    this.lastStatus = '';
  }

  componentWillUnmount = () => {
    this.protocol.close();
  };

  handleSessionButtonClick = (lvl) => {

    if (this.props.activeLevel === lvl) {
      this.setState(() => ({session: null}))
    } else {
      this.startSession(lvl)
    }
  };

  handleTogglePause = () => {
    this.setState((state) => {
      const isPaused = !state.pause;

      if (!isPaused) {
        this.step();
      }

      return {
        pause: !state.pause
      }
    });
  };

  open = async (x, y) => {
    this.lastStatus = await this.protocol.open(x, y);
  };

  startSession = async (level) => {

    await this.protocol.startSession(level);
    this.props.setActiveLevel(level);
    await this.step();
  };

  step = async () => {

    const map = await this.protocol.map();
    const solverResult = solve(map);
    const [frees] = solverResult;

    this.props.setMap(map);
    this.props.setSolverResult(solverResult);
    this.props.setProgress(this.calculateProgress(map));

    if (!this.state.pause) {

      for (let i = 0; i < frees.length; i++) {

        this.props.setOpening({
          current: i + 1,
          total: frees.length,
        });

        await this.open(frees[i][1], frees[i][0]);

        if (this.finished()) {
          return;
        }
      }

      this.step();
    }
  };

  calculateProgress = (map) => {
    let total = 0, unopened = 0;

    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === -1) {
          unopened++;
        }

        total++;
      }
    }

    return {
      current: total - unopened,
      total
    };
  };

  finished = () => {
    if (this.lastStatus.includes('You win')) {
      const password = this.lastStatus.split(':')[1].trim();
      this.props.setLevelResult(this.props.activeLevel, password);

      if (this.props.activeLevel < 4) {
        this.lastStatus = null;
        this.startSession(this.props.activeLevel + 1);
      }
      return true;
    }

    if (this.lastStatus.includes('You lose')) {
      this.props.setLevelResult(this.props.activeLevel, this.lastStatus);

      this.lastStatus = null;
      this.startSession(this.props.activeLevel);

      return true;
    }

    return false;
  };

  render() {
    return (
      <div className="App">
        <div className="container-fluid pt-3 text-center">
          <div className="row">
            <div className="col-12">
              <div className="row mb-3">
                <div className="col-4">
                  <StatLeft/>
                </div>
                <div className="col-4">
                  <StatOpening/>
                </div>
                <div className="col-4">
                  <Stat value={this.props.mineCount} name="Mines"/>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="form-inline">
                <button className="btn btn-primary mb-3 mr-sm-3" onClick={this.handleTogglePause}>
                  {this.state.pause ? 'Continue' : 'Pause'}
                </button>
                <Levels onClick={this.handleSessionButtonClick} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <MapWithPlaceholder/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const stateToProps = state => ({
  mineCount: sessionSelectors.getMineCount(state),
  sessionResults: gameSelectors.getSessionResults(state),
  activeLevel: gameSelectors.getActiveLevel(state),
});

const dispatchToProps = dispatch => ({
  setMap: (map) => dispatch(setMap(map)),
  setSolverResult: (result) => dispatch(setSolverResult(result)),
  setProgress: (progress) => dispatch(setProgress(progress)),
  setOpening: (opening) => dispatch(setOpening(opening)),
  setLevelResult: (level, result) => dispatch(setLevelResult(level, result)),
  setActiveLevel: (level) => dispatch(setActiveLevel(level))
});

export default connect(stateToProps, dispatchToProps)(App);
