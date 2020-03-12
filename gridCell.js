// The class will define the properties of a cell in the grid.
class GridCell {
  constructor(row, column) {
    (this.value = { empty: true, robot: false, accessable: true }),
      (this.target = false),
      (this.walls = []);
  }
}
