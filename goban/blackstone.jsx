import React, { Component } from "react";
import Svg, { Circle } from "react-native-svg";
import { ImagePropTypes } from "react-native";

// Simple svg black stone
class BlackStone extends Component {
  render() {
    const { cellSize } = this.props;
    return (
      <Svg height={cellSize} width={cellSize}>
        <Circle
          cx={cellSize / 2}
          cy={cellSize / 2}
          r={cellSize / 2.5}
          fill="black"
        />
      </Svg>
    );
  }
}

export default BlackStone;
