import React, {Component} from 'react';
import './App.css';
import {Solver} from './solver'
import Map from "./components/map/Map";
import Protocol from "./protocol";
import LvlButton from "./components/controls/LvlButton";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      map: [[]],
      frees: [],
      mines: [],
      candidates: [],
      session: null,
      isBusy: false,
      sessionResults: {},
      response: "",
      autoPilot: true,
      pause: false,
    };

    this.handleSessionButtonClick = this.handleSessionButtonClick.bind(this);
    this.togglePause = this.togglePause.bind(this);

    this.protocol = new Protocol("ws://hometask.eg1236.com/game1/");
    this.protocol.onStart = () => this.setState(() => ({
      isBusy: true
    }));
    this.protocol.onEnd = () => this.setState(() => ({
      isBusy: false
    }));

    this.lastStatus = null;
    // todo: correct instantiation
    this.solver = new Solver(null, false, 4);
  }

  togglePause() {
    this.setState((state) => {
      const isPaused = !state.pause;

      if (!isPaused) {
        this.step();
      }

      return {
        pause: !state.pause
      }
    });
  }

  async open(x, y) {
    this.lastStatus = await this.protocol.open(x, y);
  }

  componentWillUnmount() {
    this.protocol.close();
  }

  async startSession(level) {

    await this.protocol.startSession(level);

    this.setState(() => ({
      session: level
    }));

    this.solver = new Solver(null, false, 3 * level);
    await this.step();
  }

  async step() {

    console.log('start STARTED');

    const step_t0 = performance.now();

    const map = await this.protocol.map();
    this.solver.updateMap(map);
    const [frees, mines, candidates, descriptors] = new Solver(map).step();
    window.freeOnes = frees;

    this.setState(() => ({
      map,
      frees,
      candidates,
      descriptors,
      mines,
    }));

    if (this.state.autoPilot && !this.state.pause) {

      for (let i = 0; i < frees.length; i++) {
        const open = frees[i];
        const t0 = performance.now();
        await this.open(open[1], open[0])
        const t1 = performance.now();
        if (this.finished() === 'win') {
          if (this.state.session < 4) {
            this.lastStatus = null;
            this.startSession(this.state.session + 1);
          }
        } else if (this.finished() === 'lose') {
          // finished, but lose, restart session in order to try again...
          this.lastStatus = null;
          this.startSession(this.state.session);
        }
      }

      this.step();
    }

    const step_t2 = performance.now();
    console.log("App.step() took " + (step_t2 - step_t0) + " milliseconds.");

    console.log('start FINISHED');
  }

  updateSessionResult(result) {
    this.setState((prevState) => {
      const newState = {sessionResults: {...prevState.sessionResults}};
      newState.sessionResults[this.state.session] = result;
      return newState;
    });
  }

  // todo: this function is just a piece of art..
  finished() {
    if (this.lastStatus !== null) {
      const [win, lose] = [this.lastStatus.includes('You win'), this.lastStatus.includes('You lose')];

      if (win || lose) {
        if (win) {
          const password = this.lastStatus.split(':')[1].trim();
          this.updateSessionResult(password);
          return 'win';
        } else {
          this.updateSessionResult(this.lastStatus);
          return 'lose';
        }
      }
    }

    return 'no';
  }

  handleSessionButtonClick(lvl) {

    if (this.state.session === lvl) {
      this.setState(() => ({session: null}))
    } else {
      this.startSession(lvl)
    }
  }

  render() {
    return (
      <div className="App">
        <div className="container-fluid pt-3 text-center">
          <div className="row">
            <div className="col-2">
              {this.state.isBusy ? 'Working...' :
                <button className="btn btn-success" onClick={this.openFrees} disabled={!this.state.frees.length}>Open
                  free boxes </button>}
            </div>

            <div className="col-10">
              {[1, 2, 3, 4].map(lvl => (
                <div key={lvl} className="w-25 p-1 float-left">
                  <LvlButton lvl={lvl} session={this.state.session}
                             onClick={() => this.handleSessionButtonClick(lvl)}
                             status={this.state.sessionResults[lvl]}
                  />
                </div>))}
            </div>

          </div>
          <div className="row">
            <div className="col-12">
              <button className="btn btn-success" onClick={this.togglePause}>
                {this.state.pause ? 'Continue' : 'Pause'}
              </button>
              <button className="btn btn-success" onClick={() => {
                console.log(JSON.stringify(this.state.map))
              }}>
                current map snap
              </button>
              {/*<Map onClick={(x, y) => {*/}
              {/*  this.openSingle(x, y)*/}
              {/*}} map={this.state.map} mines={this.state.mines} descriptors={this.state.descriptors}*/}
              {/*     frees={this.state.frees}*/}
              {/*     candidates={this.state.candidates}/>*/}
              <div className="response">
                {this.state.response}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
