import React, { Component } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { cloneDeep } from "lodash";
import GobanCorner from "./corner";
import GobanSide from "./side";
import GobanCross from "./cross";

class Goban extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: this.getBoard(this.props.boardSize[0], this.props.boardSize[1]),
      turn: 0,
    };
  }

  handlePress = (cellId) => {
    let newState = _.cloneDeep(this.state);
    if (this.state.turn === 0) {
      newState.turn = 1;
      const newCell = _.cloneDeep(newState.board[cellId[0]][cellId[1]]);
      newCell.stoneState = 1;
      newState.board[cellId[0]][cellId[1]] = newCell;
      this.setState(newState);
    }
    if (this.state.turn === 1) {
      newState.turn = 0;
      const newCell = _.cloneDeep(newState.board[cellId[0]][cellId[1]]);
      newCell.stoneState = 2;
      newState.board[cellId[0]][cellId[1]] = newCell;
      this.setState(newState);
    }
  };

  /**
   * Generate a new board
   */
  getBoard = (row, col) => {
    const board = [];
    for (let i = 0; i < row; i++) {
      const horizontalRow = [];
      for (let j = 0; j < col; j++) {
        horizontalRow.push({ cellId: [i, j], stoneState: 0 });
      }
      board.push(horizontalRow);
    }
    return board;
  };

  /**
   * Generate a unique key for a given tuple
   */
  getUniqueKey = (x, y) => {
    let num = Number("1" + x + y);
    return num;
  };

  /**
   * Renders a cell given its id;
   */
  renderByID = ({ cellId, stoneState }) => {
    const row = cellId[0];
    const col = cellId[1];
    const size = this.props.boardWidth / this.props.boardSize[1];
    if (row === 0) {
      if (col === 0) {
        // Top left corner
        return (
          <GobanCorner
            cellId={cellId}
            cellSize={size}
            position="top-left"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      } else if (col === this.props.boardSize[1] - 1) {
        // Top right corner
        return (
          <GobanCorner
            cellId={cellId}
            cellSize={size}
            position="top-right"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      } else {
        // Top side
        return (
          <GobanSide
            cellId={cellId}
            cellSize={size}
            position="top"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      }
    } else if (row === this.props.boardSize[0] - 1) {
      if (col === 0) {
        // Bottom left corner
        return (
          <GobanCorner
            cellId={cellId}
            cellSize={size}
            position="bottom-left"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      } else if (col === this.props.boardSize[1] - 1) {
        // Bottom right corner
        return (
          <GobanCorner
            cellId={cellId}
            cellSize={size}
            position="bottom-right"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      } else {
        // Bottom side
        return (
          <GobanSide
            cellId={cellId}
            cellSize={size}
            position="bottom"
            stoneState={stoneState}
            handlePress={this.handlePress}
            key={this.getUniqueKey(row, col)}
          />
        );
      }
    } else if (col === 0) {
      // Left side
      return (
        <GobanSide
          cellId={cellId}
          cellSize={size}
          position="left"
          stoneState={stoneState}
          handlePress={this.handlePress}
          key={this.getUniqueKey(row, col)}
        />
      );
    } else if (col === this.props.boardSize[1] - 1) {
      // Right side
      return (
        <GobanSide
          cellId={cellId}
          cellSize={size}
          position="right"
          stoneState={stoneState}
          handlePress={this.handlePress}
          key={this.getUniqueKey(row, col)}
        />
      );
    } else {
      return (
        <GobanCross
          cellId={cellId}
          cellSize={size}
          isStar={false}
          stoneState={stoneState}
          handlePress={this.handlePress}
          key={this.getUniqueKey(row, col)}
        />
      );
    }
  };

  /**
   * Render all cells in the current board
   */
  renderCells = () => {
    let cells = this.state.board.map((cellRow, index) => {
      return (
        <View key={index} style={{ flexDirection: "row" }}>
          {cellRow.map((cell) => this.renderByID(cell))}
        </View>
      );
    });
    return cells;
  };

  render() {
    return <View>{this.renderCells()}</View>;
  }
}

export default Goban;
