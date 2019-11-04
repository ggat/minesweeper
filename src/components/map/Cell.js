import React from "react";
import './Cell.scss';

function Cell(props) {
  const {frees, mines, candidates, row, col, value} = props;

  let className;
  const content = value === -1 ? '' : value === -2 ? '*' : value;

  if (mines.some(([cRow, cCol]) => cRow === row && cCol === col)) {
    className = 'map-cell-mine'
  } else if (frees.some(([cRow, cCol]) => cRow === row && cCol === col)) {
    className = 'map-cell-certain'
  } else if (candidates.some(([cRow, cCol]) => cRow === row && cCol === col)) {
    className = ' map-cell-candidate'
  } else if (value === -1) {
    className = 'map-cell-unknown'
  } else {
    className = 'map-cell-open';
  }

  return (
    <td
      style={{ width: props.width + '%', paddingBottom: props.width + '%'}}
      width={props.width}
      data-key={`${row}x${col}`}
      className={className}>
      {props.width > 2 && <span style={{position: 'absolute'}}>{content}</span>}
    </td>
  );
}

export default React.memo(Cell);