import React, { Component } from 'react';
import './App.css';
import solver from './solver'
import Map from "./Map";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      map: [[]],
      certains: [],
      candidates: [],
      mines: [[]],
      response: "",
    };

    this.ws = new WebSocket("ws://hometask.eg1236.com/game1/");

    this.ws.onopen = (evt) => {
      this.setState({
        isConnected: true
      });
    };

    this.ws.onmessage = (evt) => {

      const [command, data] = evt.data.split(':').map(chunk => chunk.trim());

      if(command === 'map') {

        const [certains, mines, candidates] = solver(this.rawMapToArray(data));

        this.setState(() => ({
          map: this.rawMapToArray(data),
          certains,
          candidates,
          mines,
        }));
      }

      this.setState({
        response: evt.data,
      });

      if(command === 'open' && data === 'OK') {
        this.ws.send('map');
      }
    };

    this.ws.onclose = (evt) => {
      this.setState({
        isConnected: false
      });
    };
  }

  rawMapToArray(data) {
    const result = [];
    const lines = data.split('\n');

    for (let r = 0; r < lines.length; r++) {
      result[r] = [];
      for (let c = 0; c < lines[r].length; c ++) {
        result[r][c] = lines[r][c] === '□' ? -1 : parseInt(lines[r][c]);
      }
    }

    return result;
  }

  componentWillUnmount() {
    this.ws.close();
  }

  sendCommand(command) {
    this.ws.send(command);
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.sendCommand('help')}>Show help</button>

        <form onSubmit={(e) => {
          e.preventDefault();
          this.sendCommand(`new ${e.target.children.level.value}`)
        }}>
          <input type="number" name="level" min="1" max="4" defaultValue="1"/>
          <button type="submit">New session</button>
        </form>

        <form onSubmit={(e) => {
          e.preventDefault();
          this.sendCommand(`open ${e.target.children.X.value} ${e.target.children.Y.value}`)
        }}>
          <input type="number" name="X" defaultValue="0"/>
          <input type="number" name="Y" defaultValue="0"/>
          <button type="submit">Open X,Y</button>
        </form>

        <button onClick={() => this.sendCommand('map')}>Map</button>

        <div className="status">
          WS Status: {this.state.isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <br/>
        <Map map={this.state.map} mines={this.state.mines} certains={this.state.certains} candidates={this.state.candidates}/>
        <div className="response">
          {this.state.response.split(/(?:\r\n|\r|\n)/g).map( (line, index) => <div key={index}>{line}</div>)}
        </div>
      </div>
    );
  }
}

export default App;
