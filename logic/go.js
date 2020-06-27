var directions = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

// Configurations
const allowSuicide = false;

/**
 * Go board class
 * Internal state of the board is represented by 0 = empty, 1 = black, 2 = white
 */
export default class GoLogic {
  constructor(
    row,
    col,
    state = new Array(row).fill(0).map(() => new Array(col).fill(0)),
    ko = [],
    numMoves = 0
  ) {
    this.row = row;
    this.col = col;
    this.state = state;
    this.ko = ko;
    this.numMoves = numMoves;

    this.copyState = (state) => {
      return Array.from(state, (item) => [...item]);
    };
  }

  // Simulate a move
  play(x, y, player) {
    if (this.isValidMove(x, y, player)) {
      return this.move(x, y, player).updateRemoveStone(x, y);
    }
    throw new Error(`Cannot play at (${x}, ${y})`);
  }

  // Simply update the board state with a new stone
  move(x, y, player) {
    const newState = this.copyState(this.state);
    newState[x][y] = player;
    return new GoLogic(this.row, this.col, newState, [], this.numMoves + 1);
  }

  // Check for the need to remove stones after a move
  updateRemoveStone(x, y) {
    const newState = this.copyState(this.state);
    const newBoard = new GoLogic(
      this.row,
      this.col,
      newState,
      [],
      this.numMoves
    );
    for (let i = 0; i < 4; i++) {
      const newX = x + directions[i][0];
      const newY = y + directions[i][1];
      const removedStones = new Set();
      if (
        newBoard.withinBoundary(newX, newY) &&
        newBoard.hasStone(newX, newY) &&
        newBoard.checkLiberty(newX, newY) === 0
      ) {
        newBoard.dfsRemove(newX, newY, removedStones);
        if (removedStones.size == 1) {
          // console.log(`Ko position at (${newX}, ${newY})`);
          newBoard.ko.push(JSON.stringify([newX, newY]));
        }
      }
    }
    return newBoard;
  }

  // Check the liberty of a stone at coordinate (x, y).
  checkLiberty(x, y) {
    // Check for boundary conditions
    if (!this.withinBoundary(x, y)) {
      throw new Error(
        `Cannot check liberty! Index out of bound at (${x}, ${y})`
      );
    } else if (!this.hasStone(x, y)) {
      throw new Error(
        `Cannot check liberty when no stone is present at (${x}, ${y})!`
      );
    }
    return this.dfsCount(x, y);
  }

  // Check if a coordinate is within boundary of the board
  withinBoundary(x, y) {
    if (x < 0 || x > this.row - 1 || y < 0 || y > this.col - 1) {
      return false;
    }
    return true;
  }

  isValidMove(x, y, player) {
    // console.log(
    //   this.withinBoundary(x, y),
    //   this.state[x][y] === 0,
    //   !this.ko.includes(JSON.stringify([x, y])),
    //   this.move(x, y, player).checkLiberty(x, y) > 0,
    //   this.hasRemovableStone(x, y, player)
    // );
    return (
      this.withinBoundary(x, y) &&
      this.state[x][y] === 0 &&
      !this.ko.includes(JSON.stringify([x, y])) &&
      (allowSuicide ||
        this.move(x, y, player).checkLiberty(x, y) > 0 ||
        this.hasRemovableStone(x, y, player))
    );
  }

  hasStone(x, y) {
    return this.state[x][y] !== 0;
  }

  hasRemovableStone(x, y, player) {
    return directions
      .map((direction) => {
        const newX = x + direction[0];
        const newY = y + direction[1];
        if (
          this.withinBoundary(newX, newY) &&
          this.hasStone(newX, newY) &&
          this.state[newX][newY] !== player
        ) {
          return this.checkLiberty(newX, newY) == 1;
        }
      })
      .some((bool) => bool);
  }

  // Use DFS to count the number of liberties
  dfsCount(x, y, visited = new Set()) {
    if (!this.withinBoundary(x, y)) return 0;
    const currentStone = this.state[x][y];
    visited.add(JSON.stringify([x, y]));
    return directions
      .map((direction) => {
        const newX = direction[0] + x;
        const newY = direction[1] + y;
        if (
          this.withinBoundary(newX, newY) &&
          !visited.has(JSON.stringify([newX, newY]))
        ) {
          if (this.state[newX][newY] == currentStone) {
            // console.log(`going to ${newX}, ${newY}`);
            return this.dfsCount(newX, newY, visited);
          } else if (this.state[newX][newY] == 0) {
            visited.add(JSON.stringify([newX, newY]));
            // console.log(`added 1 at ${newX}, ${newY}`);
            return 1;
          } else {
            return 0;
          }
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
  }

  // Use DFS to remove a connected component
  dfsRemove(x, y, visited = new Set()) {
    if (!this.withinBoundary(x, y)) return;
    const currentStone = this.state[x][y];
    this.state[x][y] = 0;
    visited.add(JSON.stringify([x, y]));
    directions.map((direction) => {
      const newX = direction[0] + x;
      const newY = direction[1] + y;
      if (
        this.withinBoundary(newX, newY) &&
        !visited.has(JSON.stringify([newX, newY]))
      ) {
        if (this.state[newX][newY] == currentStone) {
          // console.log(`going to ${newX}, ${newY}`);
          this.dfsRemove(newX, newY, visited);
        }
      }
    });
  }
}
