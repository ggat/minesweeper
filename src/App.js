import React, {Component} from 'react';
import Protocol from "./protocol";
import solve from './solver'
import MapWithPlaceholder from "./components/map/MapWithPlaceholder";
import StatProgress from "./components/progress-stat/StatProgress";
import Stat from "./components/stat/Stat";
import Levels from "./components/controls/Levels";
import * as sessionSelectors from "./reducers/session";
import {connect} from "react-redux";
import './App.scss';
import {setMap, setSolverResult, setProgress, setOpening} from "./actions/session";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      session: null,
      sessionResults: {},
      pause: false,
    };

    this.protocol = new Protocol("ws://hometask.eg1236.com/game1/");
    this.lastStatus = '';
  }

  componentWillUnmount = () => {
    this.protocol.close();
  };

  handleSessionButtonClick = (lvl) => {

    if (this.state.session === lvl) {
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

    this.setState(() => ({
      session: level
    }));

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

  updateSessionResult = (result) => {
    this.setState((prevState) => {
      const sessionResults = {...prevState.sessionResults};
      sessionResults[this.state.session] = result;

      return {
        ...prevState,
        sessionResults
      };
    });
  };

  finished = () => {
    if (this.lastStatus.includes('You win')) {
      const password = this.lastStatus.split(':')[1].trim();
      this.updateSessionResult(password);

      if (this.state.session < 4) {
        this.lastStatus = null;
        this.startSession(this.state.session + 1);
      }
      return true;
    }

    if (this.lastStatus.includes('You lose')) {
      this.updateSessionResult(this.lastStatus);

      this.lastStatus = null;
      this.startSession(this.state.session);

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
                  <StatProgress current={this.props.progress.current} total={this.props.progress.total} name="Left"/>
                </div>
                <div className="col-4">
                  <StatProgress current={this.props.opening.current} total={this.props.opening.total} name="Opening"/>
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
                <Levels session={this.state.session}
                        onClick={this.handleSessionButtonClick}
                        sessionResults={this.state.sessionResults}/>
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
  progress: sessionSelectors.getProgress(state),
  opening: sessionSelectors.getOpening(state),
  mineCount: sessionSelectors.getMineCount(state),
});

const dispatchToProps = dispatch => ({
  setMap: (map) => dispatch(setMap(map)),
  setSolverResult: (result) => dispatch(setSolverResult(result)),
  setProgress: (progress) => dispatch(setProgress(progress)),
  setOpening: (opening) => dispatch(setOpening(opening))
});

export default connect(stateToProps, dispatchToProps)(App);
