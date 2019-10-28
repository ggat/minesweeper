import React, {Component} from 'react';
import './Map.css';
import Box from "./Box";

class Map extends Component {

  render() {
    return (<div>
      <table className="table table-minesweeper">
        <tbody>
        {
          this.props.map.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {
                  row.map((col, colIndex) => {

                      let isMine = this.props.mines[rowIndex] && this.props.mines[rowIndex][colIndex];
                      let isFree = false;
                      let isCandidate = false;

                      for (let i = 0; i < this.props.frees.length; i++) {
                        const certainBox = this.props.frees[i];

                        if (certainBox[0] === rowIndex && certainBox[1] === colIndex) {
                          isFree = true;
                          break;
                        }
                      }

                      for (let i = 0; i < this.props.candidates.length; i++) {
                        const box = this.props.candidates[i];

                        if (box[0] === rowIndex && box[1] === colIndex) {
                          isCandidate = true;
                          break;
                        }
                      }

                      return <Box
                        key={colIndex}
                        onClick={this.props.onClick}
                        r={rowIndex}
                        c={colIndex}
                        value={col}
                        {...{isMine, isCandidate, isFree}}
                      />
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