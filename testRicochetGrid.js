// import RicochetGrid from './ricochetGrid';
// import {
//   GridCell,
//   EMPTY_CELL,
//   INACCESSABLE_CELL,
//   ROBOT_CELL,
//   RIGHT,
//   LEFT,
//   UP,
//   DOWN,
// } from './gridCell';

// Make the Ricochet Robot Grid
let gameGrid = new RicochetGrid(16, 16);

gameGrid.setValue(0, 0, EMPTY_CELL);
gameGrid.setValue(0, 1, EMPTY_CELL);
gameGrid.setValue(0, 2, EMPTY_CELL);
gameGrid.setWall(0, 2, RIGHT);
gameGrid.setValue(0, 3, EMPTY_CELL);
gameGrid.setWall(0, 3, LEFT);
gameGrid.setValue(0, 4, EMPTY_CELL);
gameGrid.setValue(0, 5, EMPTY_CELL);
gameGrid.setValue(0, 6, EMPTY_CELL);
gameGrid.setValue(0, 7, EMPTY_CELL);
gameGrid.setValue(0, 8, EMPTY_CELL);
gameGrid.setValue(0, 9, EMPTY_CELL);
gameGrid.setValue(0, 10, EMPTY_CELL);
gameGrid.setValue(0, 11, EMPTY_CELL);
gameGrid.setWall(0, 11, RIGHT);
gameGrid.setValue(0, 12, EMPTY_CELL);
gameGrid.setWall(0, 12, LEFT);
gameGrid.setValue(0, 13, EMPTY_CELL);
gameGrid.setValue(0, 14, EMPTY_CELL);
gameGrid.setValue(0, 15, EMPTY_CELL);

function loadApp() {
  console.log('loadApp called.');
}
