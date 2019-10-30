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
      candidates: [],
      mines: [[]],
      session: null,
      isBusy: false,
      sessionResults: {},
      response: "",
      autoPilot: true
    };

    this.openFrees = this.openFrees.bind(this);
    this.openRandom = this.openRandom.bind(this);
    this.open = this.open.bind(this);
    this.handleSessionButtonClick = this.handleSessionButtonClick.bind(this);

    this.protocol = new Protocol("ws://hometask.eg1236.com/game1/");
    this.protocol.onStart = () => this.setState(() => ({
      isBusy: true
    }));
    this.protocol.onEnd = () => this.setState(() => ({
      isBusy: false
    }));

    this.lastStatus = null;
  }


  async openFrees() {
    for (let i = 0; i < this.state.frees.length; i++) {
      const free = this.state.frees[i];
      this.lastStatus = await this.protocol.open(free[1], free[0]);
    }

    await this.map();
  }

  async open(r, c) {
    this.lastStatus = await this.protocol.open(c, r);
    await this.map();
  }

  async openRandom() {
    const candidate = this.state.candidates[Math.round((this.state.candidates.length - 1) * Math.random())];
    this.lastStatus = await this.protocol.open(candidate[1], candidate[0]);
    await this.map();
  }

  componentWillUnmount() {
    this.protocol.close();
  }

  async startSession(level) {

    await this.protocol.startSession(level);

    this.setState(() => ({
      session: level
    }));

    await this.map();
  }

  async map() {
    const map = await this.protocol.map();
    const solver = new Solver(map);
    const [frees, mines, candidates] = solver.step();

    this.setState(() => ({
      map,
      frees,
      candidates,
      mines,
    }));

    if (this.state.autoPilot) {

      if(this.finished() === 'no') {
        if (frees.length) {
          this.openFrees();
        } else {
          const [r, c] = solver.randomCandidateBox();
          this.open(r, c);
        }
      } else if(this.finished() === 'lose') {
        // finished, but lose, restart session in order to try again...
        this.lastStatus = null;
        this.startSession(this.state.session);
      }
    }
  }

  updateSessionResult(result) {
    this.setState((prevState) => {
      const newState = {sessionResults: {}};
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
              {this.state.isBusy ? 'Loading...' :
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
              {/*<Map onClick={(x, y) => {
                this.open(x, y)
              }} map={this.state.map} mines={this.state.mines} frees={this.state.frees}
                   candidates={this.state.candidates}/>*/}
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
