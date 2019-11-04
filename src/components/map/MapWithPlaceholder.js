import React from 'react';
import Map from "./Map";
import './Map.scss';

function MapWithPlaceholder(props) {

  return ( props.map.length && props.map[0].length ?
        <Map
          map={props.map}
          frees={props.frees}
          mines={props.mines}
          candidates={props.candidates}
          descriptors={props.descriptors}
        /> :
        <h2 className="m-5">No map yet. Click any of stage buttons to start playing.</h2>
  );
}

export default MapWithPlaceholder;