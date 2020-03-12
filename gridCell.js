// The class will define the properties of a cell in the grid.
class GridCell {
  constructor() {
    this.value = {
      empty: true,
      robot: false,
      accessable: true,
    };
    this.target = false;
    this.walls = [];
  }

  // getCellValue function will return the value in cell.
  // returns an object
  getCellValue() {
    return this.value;
  }

  // setRobotOnCell function will set robot in the cell.
  setRobotOnCell() {
    if (!this.value.robot) {
      this.value.robot = true;
      this.value.empty = false;
      this.value.accessable = false;
    }
  }

  // setTargetOnCell function will set a target in the cell.
  setTargetOnCell() {
    // can only set a target if there are 2 walls on the cell.
    if (this.walls.length === 2) {
      this.target = true;
    }
  }

  // setWallonCell function will set walls on the cell given the side of the well .
  setWallonCell(side) {
    this.walls.push(side);
  }
}

export default GridCell;
