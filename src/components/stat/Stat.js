import React from "react";
import './Stat.scss';

function Stat(props) {
  return (
    <div className="StatProgress">
      <div className="title">
        <span>{props.current}</span>
        <span>/</span>
        <span>{props.total}</span>
      </div>
      <div className="subtitle pb-2">something</div>
      <div className="progress">
        <div className="progress-bar" style={{width: (props.current / props.total * 100) + '%'}} role="progressbar" aria-valuenow="75" aria-valuemin="0"
             aria-valuemax="100"></div>
      </div>
    </div>
  );
}

export default Stat;