import React from "react";
import Cell from "./Cell";

function Row(props) {

  const {value: rowValue, row} = props;
  const width = 100 / rowValue.length;

  return <tr>{rowValue.map((value, col) => <Cell key={`${row}x${col}`} {...{...props, value, row, col, width}} /> )}</tr>;
}

export default React.memo(Row);