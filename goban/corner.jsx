import React, { Component } from "react";
import Svg, { Line } from "react-native-svg";
import BlackStone from "./blackstone";
import WhiteStone from "./whitestone";

/**
 * Go Board Corner Component
 * Props: cellId, cellSize, position, stoneState
 */
class GobanCorner extends Component {
  getStone = ({ cellSize, stoneState }) => {
    switch (stoneState) {
      case 1:
        return <BlackStone cellSize={cellSize} />;
      case 2:
        return <WhiteStone cellSize={cellSize} />;
      default:
        return null;
    }
  };

  getOrientation = ({ position }) => {
    switch (position) {
      case "top-right":
        return 90;
      case "bottom-left":
        return 270;
      case "bottom-right":
        return 180;
      default:
        return 0;
    }
  };

  render() {
    const { cellSize, cellId } = this.props;
    return (
      <Svg
        width={cellSize}
        height={cellSize}
        onPress={() => this.props.handlePress(cellId)}
        rotation={this.getOrientation(this.props)}
      >
        <Line
          x1={cellSize / 2}
          y1={cellSize / 2}
          x2={cellSize / 2}
          y2={cellSize}
          stroke="black"
          strokeWidth="2"
        />
        <Line
          x1={cellSize / 2}
          y1={cellSize / 2}
          x2={cellSize}
          y2={cellSize / 2}
          stroke="black"
          strokeWidth="2"
        />
        {this.getStone(this.props)}
      </Svg>
    );
  }
}

export default GobanCorner;
