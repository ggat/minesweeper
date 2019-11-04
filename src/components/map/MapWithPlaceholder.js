import React from 'react';
import './Map.scss';
import Row from './Row'

function Map(props) {

  return (
    <div>
      <table className="table-minesweeper">
        <tbody>
        {props.map.map((row, rowIndex) => <Row key={rowIndex} {...{...props, value: row, row: rowIndex}} />)}
        </tbody>
      </table>
    </div>
  );
}

export default Map;