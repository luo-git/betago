import React, { Component } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { cloneDeep } from "lodash";
import GobanCorner from "./corner";
import GobanSide from "./side";
import GobanCross from "./cross";
import GoLogic from "../logic/go";
import { environment } from "../environment/environment";
// import * as firebase from "firebase";
// import "firebase/firestore";
import firebase from "../firebase/firebase";

var db = firebase.firestore();

/**
 * Goban Component
 * Props: boardSize
 */
class Goban extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: new GoLogic(this.props.boardSize[0], this.props.boardSize[1]),
      turn: 1,
      record: [],
    };
  }

  componentDidMount() {
    db.collection("games")
      .doc(this.props.game_id.toString())
      .onSnapshot((snapshot) =>
        this.syncWithMovesArray(this.state.board, snapshot.data().record)
      );
  }

  handlePress = (cellId) => {
    const moved = this.makeMove(cellId);

    if (moved) {
      // fetch(environment.play_game + "/" + this.props.game_id, {
      //   method: "POST",
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     move: {
      //       move_num: this.state.board.numMoves,
      //       player: this.state.turn,
      //       position: cellId,
      //     },
      //   }),
      // }).catch((error) => console.log(error));
    }
  };

  makeMove = (cellId, player = this.state.turn) => {
    if (!this.state.board.isValidMove(cellId[0], cellId[1], player)) {
      alert(`Invalid Move!`);
      return false;
    }
    let newState = cloneDeep(this.state);
    if (this.state.turn === 1) {
      newState.turn = 2;
      newState.board = newState.board.play(cellId[0], cellId[1], 1);
      this.setState(newState);
    } else if (this.state.turn === 2) {
      newState.turn = 1;
      newState.board = newState.board.play(cellId[0], cellId[1], 2);
      this.setState(newState);
    }
    return true;
  };

  syncWithMovesArray(goLogic, movesArray) {
    for (let i = goLogic.numMoves; i < movesArray.length; i++) {
      console.log(
        `syncing move at ${movesArray[i].position} by ${movesArray[i].player}`
      );
      this.makeMove(movesArray[i].position, movesArray[i].player);
    }
  }

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
    let num = 10000 + x * 100 + y;
    return num;
  };

  checkStar = (row, col) => {
    const boardRow = this.props.boardSize[0];
    const boardCol = this.props.boardSize[1];

    if (boardRow >= 11 && boardCol >= 11) {
      if (
        (row === 3 || row === boardRow - 4) &&
        (col === 3 || col === boardCol - 4)
      ) {
        return true;
      }
    } else if (boardRow >= 9 && boardCol >= 9) {
      if (
        (row === 2 || row === this.props.boardSize[0] - 3) &&
        (col === 2 || col === this.props.boardSize[1] - 3)
      ) {
        return true;
      }
    }
    if (boardRow % 2 === 1 && boardCol % 2 === 1) {
      if (
        row === Math.floor(boardRow / 2) &&
        col === Math.floor(boardCol / 2)
      ) {
        return true;
      }
      if (boardRow >= 13 && boardCol >= 13) {
        if (
          (row === 3 && col === Math.floor(boardCol / 2)) ||
          (row === Math.floor(boardRow / 2) &&
            (col === 3 || col === boardCol - 4)) ||
          (row === boardRow - 4 && col === Math.floor(boardCol / 2))
        ) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Renders a cell given its id and state
   */
  renderByID = ({ cellId, stoneState }) => {
    const row = cellId[0];
    const col = cellId[1];
    const size = Math.floor(this.props.boardWidth / this.props.boardSize[1]);
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
          isStar={this.checkStar(row, col)}
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
    let cells = this.state.board.state.map((cellRow, row) => {
      return (
        <View key={row} style={{ flexDirection: "row" }}>
          {cellRow.map((cell, col) =>
            this.renderByID({ cellId: [row, col], stoneState: cell })
          )}
        </View>
      );
    });
    return cells;
  };

  render() {
    return (
      <View style={{ backgroundColor: "#dcb35c" }}>{this.renderCells()}</View>
    );
  }
}

export default Goban;
