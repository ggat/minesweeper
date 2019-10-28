class Protocol {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.commandQueue = [];
    this.commandRunning = false;
    this.ws.onopen = this.ws.onmessage = this.ws.onerror = this._runNextCommand.bind(this);
  }

  _runNextCommand() {

    if(!this.commandQueue.length || this.commandRunning || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const [command, resolve, reject] = this.commandQueue.shift();
    this.commandRunning = true;

    const onmessage = ({data}) => {
      this.commandRunning = false;
      this.ws.removeEventListener('message', onmessage);
      resolve(data);
    };

    const onerror = (err) => {
      this.commandRunning = false;
      this.ws.removeEventListener('error', onerror);
      reject(err);
    };

    this.ws.addEventListener('message', onmessage);
    this.ws.addEventListener('error', onerror);

    this.ws.send(command);
  }

  _createExecutor(cmd) {
    return (resolve, reject) => {
      this.commandQueue.push([cmd, resolve, reject]);
      this._runNextCommand();
    }
  }

  _rawMapToArray(data) {
    const result = [];
    const lines = data.split('\n');

    const mapping = {
      '*' : -2,
      '□' : -1,
    };

    for (let r = 0; r < lines.length; r++) {
      result[r] = [];
      for (let c = 0; c < lines[r].length; c ++) {
        result[r][c] = mapping[lines[r][c]] || parseInt(lines[r][c]);
      }
    }

    return result;
  }

  set commandRunning(val) {
    this._commandRunning = val;
    if(val && typeof this.onStart === 'function') this.onStart();
    if(!val && typeof this.onEnd === 'function') this.onEnd();
  }

  get commandRunning() {
    return this._commandRunning;
  }

  async close() {
    this.ws.close();
  }

  async help() {
    return new Promise(this._createExecutor('help'));
  }

  async startSession(level) {

    const promise = new Promise(this._createExecutor(`new ${level}`));

    return new Promise((resolve, reject) => {
      promise.then(data => {
        const status = data.split(':')[1].trim();
        if(status) {
          resolve(status);
        } else {
          reject(status);
        }
      }).catch(err => reject(err))
    });
  }

  async map() {
    const promise = new Promise(this._createExecutor('map'));

    return new Promise((resolve, reject) => {
      promise.then(data => {
        resolve(this._rawMapToArray(data.split(':')[1].trim()));
      }).catch(err => reject(err))
    })
  }

  async open(x, y) {
    const promise = new Promise(this._createExecutor(`open ${x} ${y}`));

    return new Promise((resolve, reject) => {
      promise.then(data => {
        const status = data.slice(data.indexOf(':') + 1, data.length).trim();
        if(status) {
          resolve(status);
        } else {
          reject(status);
        }
      }).catch(err => reject(err))
    });
  }
}

export default Protocol;