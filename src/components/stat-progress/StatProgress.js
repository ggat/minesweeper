import React from "react";

function StatProgress(props) {
  return (
    <div className="StatProgress text-left">
      <div className="title">
        <span>{props.current}</span>
        <span>/</span>
        <span>{props.total}</span>
      </div>
      <div className="subtitle pb-2">{props.name}</div>
      {props.total > 0 && <div className="progress">
        <div className="progress-bar bg-info" style={{width: (props.current / props.total * 100) + '%'}}
             role="progressbar" aria-valuenow="75" aria-valuemin="0"
             aria-valuemax="100"></div>
      </div>}

    </div>
  );
}

export default StatProgress;