import React from "react";
import './LevelButton.scss'

class LevelButton extends React.Component {

  otherSessionStarted() {
    return this.props.session !== null && this.props.session !== this.props.lvl;
  }

  isActive() {
    return this.props.session === this.props.lvl;
  }

  render() {
    const {lvl} = this.props;
    return (
      <div className="input-group mb-3 mr-sm-3 LvlButton">
        <div className="input-group-prepend">
          <button onClick={this.props.onClick} key={lvl} disabled={this.otherSessionStarted(lvl)}
                  className={`btn ${this.isActive(lvl) ? 'btn-success' : 'btn-primary' }`}>Start level {lvl}</button>
        </div>
        <input type="text" className="form-control" readOnly value={this.props.status || 'Not finished yet'}/>
      </div>

    );
  }
}

export default LevelButton;