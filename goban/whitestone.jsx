import React, { Component } from "react";
import Svg, { Circle } from "react-native-svg";
import { ImagePropTypes } from "react-native";

// Simple svg white stone
class WhiteStone extends Component {
  render() {
    const { cellSize } = this.props;
    return (
      <Svg height={cellSize} width={cellSize}>
        <Circle
          cx={cellSize / 2}
          cy={cellSize / 2}
          r={cellSize / 2.5 - 1}
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
      </Svg>
    );
  }
}

export default WhiteStone;
