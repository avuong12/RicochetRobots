// import GridCell from './gridCell';
// Possible colors for robots.
const GREEN_ROBOT = 0;
const RED_ROBOT = 1;
const BLUE_ROBOT = 2;
const YELLOW_ROBOT = 3;

// The class will define the Ricochet Grid
class RicochetGrid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.robots = [
      { color: GREEN_ROBOT, row: undefined, column: undefined },
      { color: RED_ROBOT, row: undefined, column: undefined },
      { color: BLUE_ROBOT, row: undefined, column: undefined },
      { color: YELLOW_ROBOT, row: undefined, column: undefined },
    ];

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; ++c) {
        // push a new grid cell into each column
        row.push(new GridCell());
      }
      this.grid.push(row);
    }

    // make center inaccessable cells
    // the inaccessableCells are the four cells in the center of the board.
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

    this.setValue(centerPoint, centerPoint, RIGHT);
    this.setValue(centerPoint, centerPoint, DOWN);
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

  // robotPosition function will set the row and column for the input color of robot. While loop. Keep generating row and column number until you find an empty cell.
  initializedRobotPositions() {
    for (let i = 0; i < this.robots.length; i++) {
      let row = this.generateRandomNumber(this.rows);
      let column = this.generateRandomNumber(this.columns);
      while (this.getValue(row, column) !== EMPTY_CELL) {
        row = this.generateRandomNumber(this.rows);
        column = this.generateRandomNumber(this.columns);
      }
      this.robots[i].row = row;
      this.robots[i].column = column;
      this.setValue(row, column, ROBOT_CELL);
    }
  }

  // setInteriorWalls function will set the walls on the grid. given an array of all the walls
  setWalls(allWalls) {
    for (let i = 0; i < allWalls.length; i++) {
      this.setWall(i.row, i.column, i.side);
    }
  }

  // setTargets function will set the targets on the grid given an array of all the targets.
  setTargets(allTargets) {
    for (let i = 0; i < allTargets.length; i++) {
      this.setTarget(i.row, i.column, i.color, i.shape);
    }
  }
}

// export default RicochetGrid;
