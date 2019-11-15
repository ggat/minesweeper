import React from "react";
import LevelButton from "./LevelButton";

export default function Levels(props) {
  return [1, 2, 3, 4].map(lvl => (
    <LevelButton key={lvl} lvl={lvl} onClick={() => props.onClick(lvl)} />
  ));
}