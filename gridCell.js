// Possible values for a cell.
const EMPTY_CELL = 0;
const INACCESSABLE_CELL = 1;
const ROBOT_CELL = 2;

// Side of the Wall.
const UP = 0;
const DOWN = 1;
const RIGHT = 2;
const LEFT = 3;

// Color of target.
const GREEN_TARGET = 0;
const RED_TARGET = 1;
const BLUE_TARGET = 2;
const YELLOW_TARGET = 3;
const WILD_TARGET = 4;

// Shape of target.
const CRICLE_TARGET = 0;
const TRIANGLE_TARGET = 1;
const SQUARE_TARGET = 2;
const HEXAGON_TARGET = 3;
const VORTEX_TARGET = 4;

// The class will define the properties of a cell in the grid.
class GridCell {
  constructor() {
    this.value = EMPTY_CELL;
    // The target is unique. It has a color and a shape. //
    // Set to null
    this.target = undefined;
    //
    this.walls = [];
  }

  // getCellValue function will return the value in cell.
  // returns an object
  getCellValue() {
    return this.value;
  }

  // setCellValue function will set the value in the cell.
  setCellValue(value) {
    this.value = value;
  }

  // setTargetOnCell function will set a target in the cell.
  setTargetOnCell(color, shape) {
    this.target = {};
    this.target.color = color;
    this.target.shape = shape;
  }

  // setWallOnCell function will set walls on the cell given the side of the well.
  setWallOnCell(side) {
    this.walls.push(side);
  }

  getWalls() {
    return this.walls;
  }
}
