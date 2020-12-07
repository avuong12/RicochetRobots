const GridCell = require('./gridCellToClient');
const {
  GREEN_ROBOT,
  RED_ROBOT,
  BLUE_ROBOT,
  YELLOW_ROBOT,
  WILD_TARGET,
  targetRobotColorMap,
} = require('./variables/robotsAndTargets');
const {
  MOVE_UP,
  MOVE_DOWN,
  MOVE_RIGHT,
  MOVE_LEFT,
} = require('./variables/moves');
const {
  EMPTY_CELL,
  INACCESSABLE_CELL,
  ROBOT_CELL,
  UP,
  DOWN,
  RIGHT,
  LEFT,
} = require('./variables/gridProps');
class Grid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.robots = {};
    this.robots[GREEN_ROBOT] = {
      color: GREEN_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[RED_ROBOT] = {
      color: RED_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[BLUE_ROBOT] = {
      color: BLUE_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[YELLOW_ROBOT] = {
      color: YELLOW_ROBOT,
      row: undefined,
      column: undefined,
    };

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; ++c) {
        // push a new grid cell into each column
        row.push(new GridCell());
      }
      this.grid.push(row);
    }

    let centerPoint = Math.floor(this.rows / 2);
    this.setValue(centerPoint - 1, centerPoint - 1, INACCESSABLE_CELL);
    this.setValue(centerPoint - 1, centerPoint, INACCESSABLE_CELL);
    this.setValue(centerPoint, centerPoint - 1, INACCESSABLE_CELL);
    this.setValue(centerPoint, centerPoint, INACCESSABLE_CELL);

    // set up board walls
    // The top and bottom boarders
    for (let c = 0; c < this.columns; c++) {
      this.setWall(0, c, UP);
      this.setWall(this.rows - 1, c, DOWN);
    }

    // The left and right boarders
    for (let r = 0; r < this.rows; r++) {
      this.setWall(r, 0, LEFT);
      this.setWall(r, this.columns - 1, RIGHT);
    }

    // set up inaccessable walls
    this.setWall(centerPoint - 1, centerPoint - 1, LEFT);
    this.setWall(centerPoint - 1, centerPoint - 1, UP);

    this.setWall(centerPoint - 1, centerPoint, UP);
    this.setWall(centerPoint - 1, centerPoint, RIGHT);

    this.setWall(centerPoint, centerPoint - 1, LEFT);
    this.setWall(centerPoint, centerPoint - 1, DOWN);

    this.setWall(centerPoint, centerPoint, RIGHT);
    this.setWall(centerPoint, centerPoint, DOWN);

    // A list of targets.
    this.targets = [];

    // A list of perviousTargets
    this.wonTargets = new Set();

    // The current Target.
    this.currentTarget = undefined;
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.columns;
  }
  // getValue function will return the value in the cell at the input coordinate
  getValue(row, column) {
    return this.grid[row][column].getCellValue();
  }
  // setValue function will set the property of the cell.
  setValue(row, column, value) {
    this.grid[row][column].setCellValue(value);
  }

  // setTarget function will set the target in the cell.
  setTarget(row, column, color, shape) {
    this.grid[row][column].setTargetOnCell(color, shape);
    this.targets.push({ row: row, column: column, color: color, shape: shape });
  }

  // setWall function will set the wall(s) in the cell.
  setWall(row, column, side) {
    this.grid[row][column].setWallOnCell(side);
    if (side === LEFT && column > 0) {
      this.grid[row][column - 1].setWallOnCell(RIGHT);
    } else if (side === RIGHT && column < this.columns - 1) {
      this.grid[row][column + 1].setWallOnCell(LEFT);
    } else if (side === UP && row > 0) {
      this.grid[row - 1][column].setWallOnCell(DOWN);
    } else if (side === DOWN && row < this.rows - 1) {
      this.grid[row + 1][column].setWallOnCell(UP);
    }
  }

  // getRobotPosition function will generate a random number used for row and column of robot.
  generateRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  // Takes initial robots positions from server.
  initializedRobotPositions(robotPositions) {
    this.robots = robotPositions;
    for (let key in robotPositions) {
      this.setValue(
        robotPositions[key].row,
        robotPositions[key].column,
        ROBOT_CELL
      );
    }
  }
  // robotPosition function will set the row and column for the input color of robot. While loop. Keep generating row and column number until you find an empty cell.
  initializedRobotPositionsCandidate() {
    let robots = JSON.parse(JSON.stringify(this.robots));
    for (let key in robots) {
      let row = this.generateRandomNumber(this.rows);
      let column = this.generateRandomNumber(this.columns);
      while (this.getValue(row, column) !== EMPTY_CELL) {
        row = this.generateRandomNumber(this.rows);
        column = this.generateRandomNumber(this.columns);
      }
      robots[key].row = row;
      robots[key].column = column;
    }
    return robots;
  }

  // setRobotPostion function takes a color, row, and column and places robot in cell.
  _setRobotPostion(robotColor, row, column) {
    this.robots[robotColor].row = row;
    this.robots[robotColor].column = column;
    this.setValue(row, column, ROBOT_CELL);
  }

  getRobots() {
    return this.robots;
  }

  // setInteriorWalls function will set the walls on the grid. given an array of all the walls
  setWalls(walls) {
    for (let i = 0; i < walls.length; i++) {
      this.setWall(walls[i].row, walls[i].column, walls[i].side);
    }
  }

  // getTargets function will return the targets on the grid.
  getTargets() {
    return this.targets;
  }

  // setTargets function will set the targets on the grid given an array of all the targets.
  setTargets(targets) {
    for (let i = 0; i < targets.length; i++) {
      this.setTarget(
        targets[i].row,
        targets[i].column,
        targets[i].color,
        targets[i].shape
      );
    }
  }

  // pickNextTargetCandidate function will return a candidated for the next target.
  pickNextTargetCandidate() {
    if (this.wonTargets.size === 17) {
      return false;
    }
    let randomTargetIdx = this.generateRandomNumber(this.targets.length - 1);
    let nextTargetCandidate = this.targets[randomTargetIdx];
    let nextTargetCandidateColor = nextTargetCandidate.color;
    let nextTargetCandidateShape = nextTargetCandidate.shape;
    while (
      this.wonTargets.has(
        `${nextTargetCandidateColor}-${nextTargetCandidateShape}`
      )
    ) {
      randomTargetIdx = this.generateRandomNumber(this.targets.length - 1);
      nextTargetCandidate = this.targets[randomTargetIdx];
    }
    return nextTargetCandidate;
  }

  // gets the target that is emitted from socket.
  selectedTarget(target) {
    this.currentTarget = target;
  }

  // getCurrentTarget function returns the currentTarget.
  getCurrentTarget() {
    return this.currentTarget;
  }

  // remove target.
  removeTarget() {
    this.currentTarget = undefined;
  }

  // getWalls function will return the walls in a given cell.
  getWalls(row, column) {
    return this.grid[row][column].walls;
  }

  // movesForRobot function will return the possible directions a given robot can move.
  movesForRobot(robotColor) {
    let possibleMoves = [];
    let robot = this.robots[robotColor];
    if (robot === undefined) {
      return;
    }
    let row = robot.row;
    let column = robot.column;
    let robotWalls = this.grid[robot.row][robot.column].getWalls();
    if (
      !robotWalls.includes(UP) &&
      this.getValue(row - 1, column) === EMPTY_CELL
    ) {
      possibleMoves.push(MOVE_UP);
    }
    if (
      !robotWalls.includes(DOWN) &&
      this.getValue(row + 1, column) === EMPTY_CELL
    ) {
      possibleMoves.push(MOVE_DOWN);
    }
    if (
      !robotWalls.includes(LEFT) &&
      this.getValue(row, column - 1) === EMPTY_CELL
    ) {
      possibleMoves.push(MOVE_LEFT);
    }
    if (
      !robotWalls.includes(RIGHT) &&
      this.getValue(row, column + 1) === EMPTY_CELL
    ) {
      possibleMoves.push(MOVE_RIGHT);
    }
    return possibleMoves;
  }

  // moveRobot function will set the given robot in the new cell base on the given direction.
  moveRobot(robotColor, direction) {
    // get current location of the robot
    let initialRow = this.robots[robotColor].row;
    let initialColumn = this.robots[robotColor].column;
    this.setValue(initialRow, initialColumn, EMPTY_CELL);
    while (this.movesForRobot(robotColor).includes(direction)) {
      if (direction === MOVE_UP) {
        // update the row of the robot.
        this.robots[robotColor].row--;
      } else if (direction === MOVE_DOWN) {
        this.robots[robotColor].row++;
      } else if (direction === MOVE_LEFT) {
        this.robots[robotColor].column--;
      } else if (direction === MOVE_RIGHT) {
        this.robots[robotColor].column++;
      }
    }
    this.setValue(
      this.robots[robotColor].row,
      this.robots[robotColor].column,
      ROBOT_CELL
    );
  }
  // moveAllRobots for BFS.
  moveAllRobots(newRobotsPostions) {
    for (let key in newRobotsPostions) {
      let initialRow = this.robots[key].row;
      let initialColumn = this.robots[key].column;
      this.setValue(initialRow, initialColumn, EMPTY_CELL);

      let newRow = newRobotsPostions[key].row;
      let newColumn = newRobotsPostions[key].column;
      this.robots[key].row = newRow;
      this.robots[key].column = newColumn;
      this.setValue(newRow, newColumn, ROBOT_CELL);
    }
  }

  // reachedTarget function will return true if a robot with the same color of the target reached the target.
  // get the location of the target. this.currentTarget
  reachedTarget() {
    let targetColor = this.currentTarget.color;
    let targetRow = this.currentTarget.row;
    let targetColumn = this.currentTarget.column;
    // If there is not robot in the target cell, the target has not been reached and function will return false.
    if (this.getValue(targetRow, targetColumn) !== ROBOT_CELL) {
      return false;
    }
    // We know that there is a robot in the target cell. Any robot can reach the wild target.
    if (targetColor === WILD_TARGET) {
      return true;
    }

    let robotColor = targetRobotColorMap[targetColor];
    return (
      this.robots[robotColor].row === targetRow &&
      this.robots[robotColor].column === targetColumn
    );
  }
}

module.exports = Grid;
