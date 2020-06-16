export class Protocol {

  private ws: WebSocket
  private commandQueue: any[]
  private _commandRunning: any
  public onStart: Function | undefined
  public onEnd: Function | undefined

  constructor(url: string) {
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

    const onmessage = ({data}: {data: any}) => {
      this.commandRunning = false;
      this.ws.removeEventListener('message', onmessage);
      resolve(data);
    };

    const onerror = (err: {err: any}) => {
      this.commandRunning = false;
      this.ws.removeEventListener('error', onerror as any);
      reject(err);
    };

    this.ws.addEventListener('message', onmessage);
    this.ws.addEventListener('error', onerror as any);

    this.ws.send(command);
  }

  _createExecutor(cmd: any) {
    return (resolve: any, reject: any) => {
      this.commandQueue.push([cmd, resolve, reject]);
      this._runNextCommand();
    }
  }

  _rawMapToArray(data: any) {
    const result = [];
    const lines = data.split('\n');

    const mapping = {
      '*' : -2,
      '□' : -1,
    };

    for (let r = 0; r < lines.length; r++) {
      result[r] = [];
      for (let c = 0; c < lines[r].length; c ++) {
        const symbol = lines[r][c] as ('*' | '□')
        (result[r][c] as any) = mapping[symbol] || parseInt(lines[r][c]);
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

  async startSession(level: any) {

    const promise = new Promise(this._createExecutor(`new ${level}`));

    return new Promise((resolve, reject) => {
      promise.then(data => {
        const status = (data as any).split(':')[1].trim();
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
        resolve(this._rawMapToArray((data as any).split(':')[1].trim()));
      }).catch(err => reject(err))
    })
  }

  async open(x: any, y: any) {
    const promise = new Promise(this._createExecutor(`open ${x} ${y}`));

    return new Promise((resolve, reject) => {
      promise.then(data => {
        const status = (data as any).slice((data as any).indexOf(':') + 1, (data as any).length).trim();
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