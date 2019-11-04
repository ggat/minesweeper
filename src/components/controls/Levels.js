import React from "react";

export default function Controls(props) {
  return (
    <div>

      <button onClick={props.onOpenRandom} disabled={!props.hasRandoms}>Open Random</button>
    </div>
  );
}