import React from "react";
import LevelButton from "./LevelButton";

export default function Levels(props) {
  return [1, 2, 3, 4].map(lvl => (
    <LevelButton key={lvl} lvl={lvl}
                 session={props.session}
                 onClick={() => props.onClick(lvl)}
                 status={props.sessionResults[lvl]}/>
  ));
}