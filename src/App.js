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
  }

  togglePause() {
    this.setState((state) => {
      const isPaused = !state.pause;

      if(!isPaused) {
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

    await this.step();
  }

  async step() {
    const map = await this.protocol.map();
    const solver = new Solver(map);
    const [frees, mines, candidates, descriptors] = solver.step();

    this.setState(() => ({
      map,
      frees,
      candidates,
      descriptors,
      mines,
    }));

    if (this.state.autoPilot && !this.state.pause) {

      const opening = frees.length ? frees : [solver.randomCandidateBox()];

      for (let i = 0; i < opening.length; i++) {
        const open = opening[i];
        await this.open(open[1], open[0]);

        if(this.finished() === 'win') {
          if(this.state.session < 4) {
            this.lastStatus = null;
            this.startSession(this.state.session + 1);
          }
          return;
        } else if(this.finished() === 'lose') {
          // finished, but lose, restart session in order to try again...
          this.lastStatus = null;
          this.startSession(this.state.session);
          return;
        }
      }

      this.step();
    }
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
        if(win) {
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
              <Map onClick={(x, y) => {
                this.openSingle(x, y)
              }} map={this.state.map} mines={this.state.mines} descriptors={this.state.descriptors} frees={this.state.frees}
                   candidates={this.state.candidates}/>
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
