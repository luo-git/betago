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
    numActions = 0,
    lifeDeath = null,
    lifeDeathOriginal = null
  ) {
    this.row = row;
    this.col = col;
    this.state = state;
    this.ko = ko;
    this.numActions = numActions;
    this.lifeDeath = lifeDeath;
    this.lifeDeathOriginal = lifeDeathOriginal;

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
    return new GoLogic(this.row, this.col, newState, [], this.numActions + 1);
  }

  // Pass a move
  pass() {
    return new GoLogic(
      this.row,
      this.col,
      this.state,
      this.ko,
      this.numActions + 1
    );
  }

  // Check for the need to remove stones after a move
  updateRemoveStone(x, y) {
    const newState = this.copyState(this.state);
    const newBoard = new GoLogic(
      this.row,
      this.col,
      newState,
      [],
      this.numActions
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
        !visited.has(JSON.stringify([newX, newY])) &&
        this.state[newX][newY] == currentStone
      ) {
        // console.log(`going to ${newX}, ${newY}`);
        this.dfsRemove(newX, newY, visited);
      }
    });
  }

  initialiseLifeDeath() {
    const newBoard = new GoLogic(
      this.row,
      this.col,
      this.copyState(this.state),
      [],
      this.numActions,
      this.copyState(this.state)
    );
    newBoard.lifeDeath = newBoard.getMarking();
    newBoard.lifeDeathOriginal = newBoard.getMarking();
    return newBoard;
  }

  getMarking() {
    // If life and death has not been initiated, return.
    if (this.lifeDeath === null) return;
    // Initialise marking with empty array
    const marking = new Array(this.row)
      .fill(0)
      .map(() => new Array(this.col).fill(0));

    const visited = new Set();
    // For every intersection
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        // If intersection is occupied, assume same colour
        if (this.lifeDeath[i][j] !== 0) {
          marking[i][j] = this.lifeDeath[i][j];
        } else {
          if (!visited.has(JSON.stringify([i, j]))) {
            // Else check if the group is surrounded and mark accordingly
            const group = this.getGroupInLifeDeath(i, j);
            const colour = this.getSurroundingColour(group);
            if (colour !== -1) {
              group.forEach((coord) => (marking[coord[0]][coord[1]] = colour));
            }
            group.forEach((coord) => visited.add(JSON.stringify(coord)));
          }
        }
      }
    }
    return marking;
  }

  // Get an array of intersections which are a connected group in state
  getGroup(x, y, visited = new Set()) {
    if (!this.withinBoundary(x, y)) return;
    const currentIntersection = this.state[x][y];
    visited.add(JSON.stringify([x, y]));
    directions.map((direction) => {
      const newX = direction[0] + x;
      const newY = direction[1] + y;
      if (
        this.withinBoundary(newX, newY) &&
        !visited.has(JSON.stringify([newX, newY])) &&
        this.state[newX][newY] == currentIntersection
      ) {
        this.getGroup(newX, newY, visited);
      }
    });
    return [...visited].map((jsonString) => JSON.parse(jsonString));
  }

  // Get an array of intersections which are a connected group in
  // Life death array
  getGroupInLifeDeath(x, y, visited = new Set()) {
    if (!this.withinBoundary(x, y)) return;
    const currentIntersection = this.lifeDeath[x][y];
    visited.add(JSON.stringify([x, y]));
    directions.map((direction) => {
      const newX = direction[0] + x;
      const newY = direction[1] + y;
      if (
        this.withinBoundary(newX, newY) &&
        !visited.has(JSON.stringify([newX, newY])) &&
        this.lifeDeath[newX][newY] == currentIntersection
      ) {
        this.getGroupInLifeDeath(newX, newY, visited);
      }
    });
    return [...visited].map((jsonString) => JSON.parse(jsonString));
  }

  // Get an array of intersections which are surrounded by opponent
  // colour
  getLargeGroup(x, y, initial = null, visited = new Set()) {
    if (!this.withinBoundary(x, y)) return;
    let globalColour = initial;
    if (globalColour === null) {
      globalColour = this.state[x][y];
    }
    // Not permitting getting group from empty intersection
    if (globalColour === 0) {
      return;
    }

    visited.add(JSON.stringify([x, y]));
    directions.map((direction) => {
      const newX = direction[0] + x;
      const newY = direction[1] + y;
      if (
        this.withinBoundary(newX, newY) &&
        !visited.has(JSON.stringify([newX, newY])) &&
        (this.state[newX][newY] === globalColour ||
          this.state[newX][newY] === 0)
      ) {
        this.getLargeGroup(newX, newY, globalColour, visited);
      }
    });
    return [...visited].map((jsonString) => JSON.parse(jsonString));
  }

  /**
   * Determin if a group of empty intersection is surrounded
   * by a single colour in life and death array and return
   * the surrounding colour.
   * Returns the colour or -1 if not completely surrounded.
   * @param {array} group
   * @return {1, 2, -1}
   */
  getSurroundingColour = (group) => {
    const colour = new Set();
    try {
      group.forEach((coord) => {
        directions.map((direction) => {
          const newX = direction[0] + coord[0];
          const newY = direction[1] + coord[1];
          if (
            this.withinBoundary(newX, newY) &&
            group.findIndex(
              (arr) => JSON.stringify(arr) === JSON.stringify([newX, newY])
            ) === -1
          ) {
            colour.add(this.state[newX][newY]);
            if (colour.size > 1) {
              throw Error("Not surrounded!");
            }
          }
        });
      });
    } catch (error) {
      return -1;
    }
    return colour.values().next().value;
  };

  // Mark a group of stones dead
  markDead = (group) => {
    if (group.length === 0) {
      return;
    }
    if (this.lifeDeath === null) {
      throw Error("Please initialise life death first!");
    }
    let newColour = this.getSurroundingColour(group);
    if (newColour === -1) {
      throw Error("Group not surrounded!", group, this.state);
    }
    const newBoard = new GoLogic(
      this.row,
      this.col,
      this.copyState(this.state),
      this.ko,
      this.numActions,
      this.copyState(this.lifeDeath),
      this.lifeDeathOriginal
    );
    group.forEach(
      (coord) => (newBoard.lifeDeath[coord[0]][coord[1]] = newColour)
    );
    return newBoard;
  };

  // Mark a group of stones as alive
  markAlive = (group) => {
    if (group.length === 0) {
      return;
    }
    if (this.lifeDeath === null) {
      throw Error("Please initialise life death first!");
    }
    const newBoard = new GoLogic(
      this.row,
      this.col,
      this.copyState(this.state),
      this.ko,
      this.numActions,
      this.copyState(this.lifeDeath),
      this.lifeDeathOriginal
    );
    group.forEach(
      (coord) =>
        (newBoard.lifeDeath[coord[0]][coord[1]] = this.lifeDeathOriginal[
          coord[0]
        ][coord[1]])
    );
    return newBoard;
  };

  getGroupColour = (group) => {
    for (let i = 0; i < group.length; i++) {
      const colour = this.state[group[i][0]][group[i][1]];
      if (colour !== 0) {
        return colour;
      }
    }
    return 0;
  };

  isMarkedDead = (x, y) => {
    // console.log(
    //   group.filter(
    //     (coord) =>
    //       this.lifeDeath[coord[0]][coord[1]] !==
    //         this.state[coord[0]][coord[1]] &&
    //       this.state[coord[0]][coord[1]] !== 0
    //   ).length,
    //   group.length
    // );
    return this.state !== 0 && this.state[x][y] !== this.lifeDeath[x][y];
  };

  getStringRep = (array = this.state) => {
    const string = array.reduce(
      (total, row) =>
        total + row.reduce((total, cell) => total + cell + " ", "") + "\n",
      ""
    );
    return string;
  };

  // Get current scoring based on marked life and death
  getScore = () => {
    const black = this.lifeDeath.reduce(
      (total, row) =>
        total + row.reduce((total, cell) => total + (cell === 1 ? 1 : 0), 0),
      0
    );
    const mutual = this.lifeDeath.reduce(
      (total, row) =>
        total + row.reduce((total, cell) => total + (cell === 0 ? 1 : 0), 0),
      0
    );
    const blackTotal = black + mutual / 2;
    return blackTotal;
  };
}

// Board marking test
// var board = new GoLogic(9, 9);
// board.state = [
//   [2, 2, 0, 2, 1, 0, 0, 0, 0],
//   [0, 2, 2, 2, 1, 1, 0, 0, 0],
//   [1, 2, 2, 1, 1, 0, 1, 0, 0],
//   [1, 1, 1, 2, 2, 1, 0, 0, 0],
//   [1, 0, 1, 2, 1, 0, 0, 0, 0],
//   [1, 1, 2, 2, 1, 0, 0, 1, 1],
//   [2, 2, 2, 1, 1, 1, 1, 1, 0],
//   [0, 0, 2, 2, 2, 1, 2, 2, 2],
//   [0, 0, 0, 0, 2, 1, 2, 0, 0],
// ];

// board = board.initialiseLifeDeath();

// console.log(board.getSurroundingColour(board.getLargeGroup(1, 5)));

// console.log(board.getStringRep(board.lifeDeath));
// console.log();
// console.log(board.getStringRep(board.getMarking()));

// board = board.markDead(board.getLargeGroup(1, 5));

// console.log(board.getStringRep(board.lifeDeath));
// console.log();
// console.log(board.getStringRep(board.getMarking()));

// board = board.markAlive(board.getLargeGroup(1, 5));

// console.log(board.getStringRep(board.lifeDeath));
// console.log();
// console.log(board.getStringRep(board.getMarking()));
