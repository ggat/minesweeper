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

                      let isMine = false;
                      let isFree = false;
                      let isCandidate = false;
                      let isDescriptor = false;

                      for (let i = 0; i < this.props.frees.length; i++) {
                        const certainBox = this.props.frees[i];

                        if (certainBox[0] === rowIndex && certainBox[1] === colIndex) {
                          isFree = true;
                          break;
                        }
                      }

                      for (let i = 0; i < this.props.descriptors.length; i++) {
                        const descriptorBox = this.props.descriptors[i];

                        if (descriptorBox[0] === rowIndex && descriptorBox[1] === colIndex) {
                          isDescriptor = true;
                          break;
                        }
                      }

                      for (let i = 0; i < this.props.mines.length; i++) {
                        const minedBox = this.props.mines[i];

                        if (minedBox[0] === rowIndex && minedBox[1] === colIndex) {
                          isMine = true;
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
                        {...{isMine, isCandidate, isFree, isDescriptor}}
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