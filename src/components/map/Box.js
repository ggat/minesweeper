import React from "react";
import './Box.css';


//TODO: validate props
function Box(props) {

  const {isMine, isFree, isCandidate, isDescriptor, r, c, value} = props;

  let className = 'map-cell-unknown',
      content = value === -1 ? 'U' : value === -2 ? '*' : value;

  if(isMine) {
    className = 'map-cell-mine'
  } else if(isFree) {
    className = 'map-cell-certain'
  } else if(isDescriptor) {
    className = 'map-cell-descriptor'
  }  else if (value === -1) {
    className = 'map-cell-unknown'
  } else {
    className = 'map-cell-open';
  }

  if (isCandidate) {
    className += ' map-cell-candidate'
  }

  return (
    <td
      onClick={e => props.onClick(...e.target.dataset.key.split('x').map(val => parseInt(val)))}
      data-key={`${r}x${c}`}
      className={className}>
      {/*{content}*/}
      {`${r}x${c}`} <br/> {content}
    </td>
  );
}

export default Box;