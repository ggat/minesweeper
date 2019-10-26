import React, {Component} from 'react';
import './Map.css';

class Map extends Component {
  render() {
    return (<div>
      <table>
        <tbody>
        {
          this.props.map.map( (row, rowIndex) => (
              <tr key={rowIndex}>
                {
                  row.map( (col, colIndex) => {
                      let className = 'map-cell-unknown';
                      let isMine = this.props.mines[rowIndex] && this.props.mines[rowIndex][colIndex];
                      let isCertain = false;
                      let isCandidate = false;

                      for (let i = 0; i < this.props.certains.length; i++) {
                        const certainBox = this.props.certains[i];

                        if(certainBox[0] === rowIndex && certainBox[1] === colIndex) {
                          isCertain = true;
                          break;
                        }
                      }

                      for (let i = 0; i < this.props.candidates.length; i++) {
                        const box = this.props.candidates[i];

                        if(box[0] === rowIndex && box[1] === colIndex) {
                          isCandidate = true;
                          break;
                        }
                      }

                      if(isMine) {
                        className = 'map-cell-mine'
                      } else if(isCertain) {
                        className = 'map-cell-certain'
                      }  else if (col === -1) {
                        className = 'map-cell-unknown'
                      } else {
                        className = 'map-cell-open';
                      }

                      if (isCandidate) {
                        className += ' map-cell-candidate'
                      }

                      return <td key={colIndex} className={className}>{col === -1 ? 'U' : col}</td>
                    }
                  )}
              </tr>
            )
          )
        }
        </tbody>
      </table>
    </div>);
  }
}

export default Map;