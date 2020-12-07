const { EMPTY_CELL } = require('./variables/gridProps');

class GridCell {
  constructor() {
    this.value = EMPTY_CELL;
    this.target = undefined;
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

  // getTargetOnCell function will return the target on the cell.
  getTargetOnCell() {
    return this.target;
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
module.exports = GridCell;
