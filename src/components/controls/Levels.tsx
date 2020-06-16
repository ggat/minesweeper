import React from "react";
import LevelButton from "./LevelButton";

interface Props {
  session: number | null;
  onClick: (lvl: number) => void;
  sessionResults: { [key: string]: string };
}

const Levels: React.FC<Props> = (props) => (
  <React.Fragment>
    {[1, 2, 3, 4].map((lvl) => (
      <LevelButton
        key={lvl}
        lvl={lvl}
        session={props.session}
        onClick={() => props.onClick(lvl)}
        status={props.sessionResults[lvl]}
      />
    ))}
  </React.Fragment>
);

export default Levels