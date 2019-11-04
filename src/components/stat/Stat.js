import React from "react";
import './Stat.scss';

function Stat(props) {
  return (
    <div className="Stat text-left">
      <div className="title">
        <span>{props.value}</span>
      </div>
      <div className="subtitle pb-2">{props.name}</div>
    </div>
  );
}

export default Stat;