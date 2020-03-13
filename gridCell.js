// Possible values for a cell.
const EMPTY_CELL = 0;
const INACCESSABLE_CELL = 1;
const ROBOT_CELL = 2;

// Side of the Wall.
const UP = 0;
const DOWN = 1;
const RIGHT = 2;
const LEFT = 3;

// The class will define the properties of a cell in the grid.
class GridCell {
  constructor() {
    this.value = EMPTY_CELL;
    // The target is unique. It has a color and a shape. //
    // Set to null
    this.target = { color: undefined, shape: undefined };
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
    this.target.color = color;
    this.target.shape = shape;
  }

  // setWallOnCell function will set walls on the cell given the side of the well.
  // Make function set wall of the other cell
  setWallOnCell(side) {
    this.walls.push(side);
  }
}
