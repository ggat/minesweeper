import React, {Component} from 'react';
import Protocol from "./protocol";
import solve from './solver'
import MapWithPlaceholder from "./components/map/MapWithPlaceholder";
import StatProgress from "./components/progress-stat/StatProgress";
import Stat from "./components/stat/Stat";
import Levels from "./components/controls/Levels"
import './App.scss';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      map: [[]],
      frees: [],
      mines: [],
      candidates: [],
      descriptors: [],
      session: null,
      isBusy: false,
      sessionResults: {},
      opening: {
        current: 0,
        total: 0
      },
      progress: {
        current: 0,
        total: 0
      },
      pause: false,
    };

    this.protocol = new Protocol("ws://hometask.eg1236.com/game1/");
    this.protocol.onStart = () => this.setState(() => ({isBusy: true}));
    this.protocol.onEnd = () => this.setState(() => ({isBusy: false}));

    this.lastStatus = null;
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
    const [frees, mines, candidates, descriptors] = solve(map);

    this.setState(() => ({
      map,
      frees,
      candidates,
      descriptors,
      mines,
      progress: this.calculateProgress(map)
    }));

    if (!this.state.pause) {

      for (let i = 0; i < frees.length; i++) {

        this.setState(() => ({
          opening: {
            current: i + 1,
            total: frees.length,
          }
        }));

        const open = frees[i];
        await this.open(open[1], open[0]);

        if (this.finished() === 'win') {
          if (this.state.session < 4) {
            this.lastStatus = null;
            this.startSession(this.state.session + 1);
          }
          return;
        } else if (this.finished() === 'lose') {
          // finished, but lose, restart session in order to try again...
          this.lastStatus = null;
          this.startSession(this.state.session);
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
      const newState = {sessionResults: {...prevState.sessionResults}};
      newState.sessionResults[this.state.session] = result;
      return newState;
    });
  };

  // todo: this function is just a piece of art..
  finished = () => {
    if (this.lastStatus !== null) {
      const [win, lose] = [this.lastStatus.includes('You win'), this.lastStatus.includes('You lose')];

      if (win || lose) {
        if (win) {
          const password = this.lastStatus.split(':')[1].trim();
          this.updateSessionResult(password);
          console.log('it was win', password);
          return 'win';
        } else {
          this.updateSessionResult(this.lastStatus);
          return 'lose';
        }
      }
    }

    return 'no';
  };

  render() {
    return (
      <div className="App">
        <div className="container-fluid pt-3 text-center">
          <div className="row">
            <div className="col-12">
              <div className="row mb-3">
                <div className="col-4">
                  <StatProgress current={this.state.progress.current} total={this.state.progress.total} name={"Left"}/>
                </div>
                <div className="col-4">
                  <StatProgress current={this.state.opening.current} total={this.state.opening.total} name={"Opening"}/>
                </div>
                <div className="col-4">
                  <Stat value={this.state.mines.length} name="Mines"/>
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
              <MapWithPlaceholder map={this.state.map}
                                  frees={this.state.frees}
                                  mines={this.state.mines}
                                  candidates={this.state.candidates}
                                  descriptors={this.state.descriptors}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
