import React, { Component } from "react";
import { View } from "react-native";
import { cloneDeep } from "lodash";
import GobanCorner from "./corner";
import GobanSide from "./side";
import GobanCross from "./cross";
import GoLogic from "../logic/go";
import { environment } from "../environment/environment";
import firebase from "../firebase/firebase";
import getUserToken from "../firebase/token";

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
      unsubGameListener: null,
      isPlayable: true,
      isCountingMode: false,
      numPasses: 0,
      lastPass: false,
      numMarkings: 0,
      oppLastEmote: { id: -1, time: -1 },
      myLastEmote: { id: -1, time: -1 },
      emoteEnabled: true,
    };
  }

  componentDidMount() {
    if (this.props.role === "spectator" && this.props.is_over) {
      // If spectating, just fetch whole game
      console.log("Spectating game" + this.props.game_id);
      fetch(environment.game + "/" + this.props.game_id + "/record")
        .then((data) => data.json())
        .then((json) => this.syncWithMovesArray(this.state.board, json.record));
      this.setState({ isPlayable: false });
    } else if (
      ["black", "white", "spectator"].indexOf(this.props.role) !== -1
    ) {
      // If playing (as black or white), listen to game record changes.
      const unsubGameListener = db
        .collection("kibo")
        .doc(this.props.game_id.toString())
        .onSnapshot((snapshot) => {
          this.syncWithMovesArray(this.state.board, snapshot.data().record);
          this.props.blackClock.setTime(snapshot.data().time_left_black);
          this.props.whiteClock.setTime(snapshot.data().time_left_white);
          if (snapshot.data().is_over) {
            this.setState({ isPlayable: false });
            this.setState({ isCounting: false });
            this.props.setIsCounting(false);
            alert(snapshot.data().result);
            this.props.handleGameOver(snapshot.data().result);
            this.props.setUpdate();
          } else {
            if (snapshot.data().isCounting === true) {
              if (!this.state.isCountingMode) {
                this.setState({
                  board: this.state.board.initialiseLifeDeath(),
                });
              }
              this.setState({ isCountingMode: true });
              this.syncWithMarkingArray(snapshot.data().marking);
              if (
                snapshot.data().black_accept === true &&
                snapshot.data().white_accept === true
              ) {
                console.log("Both sides agreed to result");
                this.handleResult();
              }
            } else if (
              this.state.isCountingMode &&
              snapshot.data().isCounting === false
            ) {
              this.quitCounting();
            }
          }

          if (
            snapshot.data().black_emote !== undefined &&
            this.props.role === "white"
          ) {
            if (
              snapshot.data().black_emote.id !== null &&
              !(
                snapshot.data().black_emote.id === this.state.oppLastEmote.id &&
                snapshot.data().black_emote.time ===
                  this.state.oppLastEmote.time
              )
            ) {
              this.props.setOppEmoteId(snapshot.data().black_emote);
              this.setState({ oppLastEmote: snapshot.data().black_emote });
            }
          } else if (
            snapshot.data().white_emote !== undefined &&
            this.props.role === "black"
          ) {
            if (
              snapshot.data().white_emote.id !== null &&
              !(
                snapshot.data().white_emote.id === this.state.oppLastEmote.id &&
                snapshot.data().white_emote.time ===
                  this.state.oppLastEmote.time
              )
            ) {
              // console.log(
              //   "white emote updated!",
              //   this.state.oppLastEmote,
              //   snapshot.data().white_emote,
              //   snapshot.data().white_emote.id === this.state.oppLastEmote.id,
              //   snapshot.data().white_emote.time ===
              //     this.state.oppLastEmote.time
              // );
              this.props.setOppEmoteId(snapshot.data().white_emote);
              this.setState({ oppLastEmote: snapshot.data().white_emote });
            }
          } else if (this.props.role === "spectator") {
            if (
              snapshot.data().black_emote.id !== null &&
              !(
                snapshot.data().black_emote.id === this.state.myLastEmote.id &&
                snapshot.data().black_emote.time === this.state.myLastEmote.time
              )
            ) {
              this.props.setMyEmoteId(snapshot.data().black_emote);
              this.setState({ myLastEmote: snapshot.data().black_emote });
            }
            if (
              snapshot.data().white_emote.id !== null &&
              !(
                snapshot.data().white_emote.id === this.state.oppLastEmote.id &&
                snapshot.data().white_emote.time ===
                  this.state.oppLastEmote.time
              )
            ) {
              this.props.setOppEmoteId(snapshot.data().white_emote);
              this.setState({ oppLastEmote: snapshot.data().white_emote });
            }
          }
        });
      this.setState({ unsubGameListener });
    }
  }

  // Unsub to game listener after unmounting of board to prevent memory leak
  componentWillUnmount() {
    if (this.state.unsubGameListener !== null) {
      this.state.unsubGameListener();
      console.log("Unsubscribed to game listener!");
    }
  }

  handlePress = (cellId) => {
    if (this.state.isCountingMode) {
      // Only allow marking of own dead stones
      if (
        (this.props.role === "black" &&
          this.state.board.state[cellId[0]][cellId[1]] === 1) ||
        (this.props.role === "white" &&
          this.state.board.state[cellId[0]][cellId[1]] === 2) ||
        this.props.gameMode === "Test"
      ) {
        this.handleMark(cellId);
        this.sendMark(cellId);
      }
    } else {
      if (
        ((this.props.role === "black" && this.state.turn === 1) ||
          (this.props.role === "white" && this.state.turn === 2) ||
          this.props.gameMode === "Test") &&
        this.state.isPlayable === true
      ) {
        const moved = this.makeMove(cellId);
        if (moved) {
          getUserToken().then((userToken) =>
            fetch(environment.game + "/" + this.props.game_id + "/play", {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                move: {
                  move_num: this.state.board.numActions,
                  player: this.state.turn === 1 ? 2 : 1,
                  position: cellId,
                },
                time_left_black: this.props.blackClock.getTime(),
                time_left_white: this.props.whiteClock.getTime(),
              }),
            }).catch((error) => console.log(error))
          );
        }
      }
    }
  };

  // Handle marking of territory during counting
  handleMark = (cellId) => {
    // Can't mark none stone intersection
    if (this.state.board.state[cellId[0]][cellId[1]] === 0) {
      return false;
    }
    const board = this.state.board;
    const group = board.getLargeGroup(cellId[0], cellId[1]);
    if (!board.isMarkedDead(cellId[0], cellId[1])) {
      this.setState({ board: board.markDead(group) });
    } else {
      this.setState({ board: board.markAlive(group) });
    }
    // console.log(
    //   "\n" + this.state.board.getStringRep(this.state.board.lifeDeath)
    // );
    // console.log("\n" + this.state.board.getScore());
    return true;
  };

  sendMark = (cellId) => {
    console.log(environment.game + "/" + this.props.game_id + "/marking");
    getUserToken().then((userToken) =>
      fetch(environment.game + "/" + this.props.game_id + "/marking", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          marking: {
            player: this.props.role === "black" ? 1 : 2,
            position: cellId,
            time: Date.now(),
          },
        }),
      }).catch((error) => console.log(error))
    );
  };

  // Deprecated due to high latency
  syncClockWithServer = () => {
    getUserToken().then((userToken) =>
      fetch(environment.game + "/" + this.props.game_id + "/time", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          time_left_black: this.props.blackClock.getTime(),
          time_left_white: this.props.whiteClock.getTime(),
        }),
      }).catch((error) => console.log(error))
    );
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
      this.props.setTurn(2);
      this.setState(newState);
      this.props.blackClock.pause();
      this.props.whiteClock.start();
    } else if (this.state.turn === 2) {
      newState.turn = 1;
      newState.board = newState.board.play(cellId[0], cellId[1], 2);
      this.props.setTurn(1);
      this.setState(newState);
      this.props.blackClock.start();
      this.props.whiteClock.pause();
    }
    this.props.setActionNum(this.state.board.numActions);
    this.props.setMoveNum(this.state.board.numActions - this.state.numPasses);
    if (this.state.isCountingMode) {
      this.quitCounting();
    }
    return true;
  };

  syncWithMovesArray(goLogic, movesArray) {
    if (this.props.role === "spectator") {
      const newState = cloneDeep(this.state);
      for (let i = goLogic.numActions; i < movesArray.length; i++) {
        if (
          movesArray[i].position[0] === -1 &&
          movesArray[i].position[1] === -1
        ) {
          newState.board = newState.board.pass();
        } else {
          newState.board = newState.board.play(
            movesArray[i].position[0],
            movesArray[i].position[1],
            movesArray[i].player
          );
        }
      }
      this.setState(newState);
    } else {
      for (let i = goLogic.numActions; i < movesArray.length; i++) {
        if (
          movesArray[i].position[0] === -1 &&
          movesArray[i].position[1] === -1
        ) {
          this.handlePass();
        } else {
          this.makeMove(movesArray[i].position, movesArray[i].player);
        }
      }
    }
  }

  syncWithMarkingArray(markingArray) {
    for (let i = this.state.numMarkings; i < markingArray.length; i++) {
      // console.log(
      //   `[${i}] I am ${this.props.role} and the player who made the call is ${markingArray[i].player}`
      // );
      if (
        (this.props.role === "black" && markingArray[i].player === 2) ||
        (this.props.role === "white" && markingArray[i].player === 1)
      ) {
        // console.log(
        //   `[${i}] ${this.props.role} syncing marking at ${markingArray[i].position} by ${markingArray[i].player}`
        // );
        this.handleMark(markingArray[i].position);
      }
      this.setState({ numMarkings: this.state.numMarkings + 1 });
    }
  }

  handlePass() {
    if (this.state.turn === 1) {
      if (!this.props.is_over) {
        alert("Black passed");
      }
      this.setState({ turn: 2 });
      this.setState({ board: this.state.board.pass() });
      this.props.setTurn(2);
      this.props.blackClock.pause();
      this.props.whiteClock.start();
    } else if (this.state.turn === 2) {
      if (!this.props.is_over) {
        alert("White passed");
      }
      this.setState({ turn: 1 });
      this.setState({ board: this.state.board.pass() });
      this.props.setTurn(1);
      this.props.blackClock.start();
      this.props.whiteClock.pause();
    }
    if (this.state.lastPass) {
      this.triggerCounting();
    }
    this.setState({ lastPass: true });
    this.setState({ numPasses: this.state.numPasses + 1 });
    this.props.setActionNum(this.state.board.numActions);
    this.props.setMoveNum(this.state.board.numActions - this.state.numPasses);
  }

  triggerCounting = () => {
    console.log("Counting triggered");
    this.props.blackClock.pause();
    this.props.whiteClock.pause();
    this.setState({ isPlayable: false });
    getUserToken()
      .then((userToken) =>
        fetch(environment.game + "/" + this.props.game_id + "/count", {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            authorization: `Bearer ${userToken}`,
          },
          body: {},
        }).catch((error) => console.log(error))
      )
      .then(() => this.props.setIsCounting(true));
  };

  quitCounting = () => {
    console.log("Counting stopped!");
    this.setState({ isPlayable: true });
    this.setState({ isCountingMode: false });
    this.setState({ lastPass: false });
    this.props.setIsCounting(false);
    if (this.state.turn === 1) {
      this.props.blackClock.start();
      this.props.whiteClock.pause();
    } else if (this.state.turn === 2) {
      this.props.blackClock.pause();
      this.props.whiteClock.start();
    }
  };

  handleResult = () => {
    const blackTerritory = this.state.board.getScore();
    const blackAdvantage =
      blackTerritory -
      ((this.state.board.row * this.state.board.col) / 2 + 3.75);
    console.log("black advantage is", blackAdvantage);
    if (
      (blackAdvantage < 0 && this.props.role === "black") ||
      (blackAdvantage >= 0 && this.props.role === "white")
    ) {
      this.handleLose(Math.abs(blackAdvantage) + " points");
    }
  };

  handleLose = (reason) => {
    getUserToken().then((userToken) => {
      console.log(`${environment.game}/${this.props.game_id}/lose`);
      fetch(`${environment.game}/${this.props.game_id}/lose`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          reason: reason,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert(`Loss not accpeted!`);
            throw Error("Loss not accepted!" + JSON.stringify(response));
          }
          return response;
        })
        .catch((error) => console.log(error));
    });
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
  renderByID = ({ cellId, stoneState, marking }) => {
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
            marking={marking}
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
            marking={marking}
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
            marking={marking}
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
            marking={marking}
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
            marking={marking}
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
            marking={marking}
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
          marking={marking}
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
          marking={marking}
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
          marking={marking}
          key={this.getUniqueKey(row, col)}
        />
      );
    }
  };

  /**
   * Render all cells in the current board
   */
  renderCells = () => {
    let marking = undefined;
    if (this.state.isCountingMode) {
      marking = this.state.board.getMarking();
    }
    let cells = this.state.board.state.map((cellRow, row) => {
      return (
        <View key={row} style={{ flexDirection: "row" }}>
          {cellRow.map((cell, col) =>
            this.renderByID({
              cellId: [row, col],
              stoneState: cell,
              marking: this.state.isCountingMode
                ? marking[row][col]
                : undefined,
            })
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
