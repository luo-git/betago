import React, { Component } from "react";
import Svg, { Line, Circle, Rect } from "react-native-svg";
import BlackStone from "./blackstone";
import WhiteStone from "./whitestone";

/**
 * Go Board Cross Component
 * Props: cellId, cellSize, isStar, stoneState
 */
class GobanCross extends Component {
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

  getStar = ({ cellSize, isStar }) => {
    if (isStar) {
      return (
        <Circle
          cx={cellSize / 2}
          cy={cellSize / 2}
          r={cellSize / 5}
          fill="black"
        />
      );
    }
    return null;
  };

  getMarking = ({ cellSize, marking }) => {
    if (marking !== this.props.stoneState) {
      if (marking === 1) {
        return (
          <Rect
            x={cellSize / 4}
            y={cellSize / 4}
            width={cellSize / 2}
            height={cellSize / 2}
            fill="black"
          />
        );
      } else if (marking === 2) {
        return (
          <Rect
            x={cellSize / 4}
            y={cellSize / 4}
            width={cellSize / 2}
            height={cellSize / 2}
            fill="white"
          />
        );
      }
    }
  };

  render() {
    const { cellSize, cellId } = this.props;
    return (
      <Svg
        width={cellSize}
        height={cellSize}
        onPress={() => this.props.handlePress(cellId)}
      >
        <Line
          x1="0"
          y1={cellSize / 2}
          x2={cellSize}
          y2={cellSize / 2}
          stroke="black"
          strokeWidth={Math.floor(1 + cellSize / 20)}
        />
        <Line
          x1={cellSize / 2}
          y1="0"
          x2={cellSize / 2}
          y2={cellSize}
          stroke="black"
          strokeWidth={Math.floor(1 + cellSize / 20)}
        />
        {this.getStar(this.props)}
        {this.getStone(this.props)}
        {this.getMarking(this.props)}
      </Svg>
    );
  }
}

export default GobanCross;
