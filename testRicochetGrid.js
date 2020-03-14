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

let walls = [
  { row: 0, column: 2, side: RIGHT },
  { row: 0, column: 11, side: RIGHT },
  { row: 1, column: 5, side: LEFT },
  { row: 1, column: 5, side: DOWN },
  { row: 2, column: 7, side: RIGHT },
  { row: 2, column: 7, side: DOWN },
  { row: 2, column: 11, side: RIGHT },
  { row: 2, column: 11, side: DOWN },
  { row: 3, column: 13, side: UP },
  { row: 3, column: 13, side: RIGHT },
  { row: 4, column: 0, side: UP },
  { row: 4, column: 3, side: RIGHT },
  { row: 4, column: 3, side: DOWN },
  { row: 4, column: 10, side: LEFT },
  { row: 4, column: 10, side: DOWN },
  { row: 5, column: 6, side: UP },
  { row: 5, column: 6, side: LEFT },
  { row: 5, column: 12, side: UP },
  { row: 5, column: 12, side: LEFT },
  { row: 6, column: 1, side: UP },
  { row: 6, column: 1, side: RIGHT },
  { row: 6, column: 15, side: UP },
  { row: 9, column: 3, side: UP },
  { row: 9, column: 3, side: RIGHT },
  { row: 9, column: 12, side: LEFT },
  { row: 9, column: 12, side: UP },
  { row: 10, column: 10, side: DOWN },
  { row: 10, column: 10, side: RIGHT },
  { row: 10, column: 15, side: UP },
  { row: 11, column: 1, side: LEFT },
  { row: 11, column: 1, side: DOWN },
  { row: 12, column: 6, side: DOWN },
  { row: 12, column: 6, side: RIGHT },
  { row: 12, column: 14, side: UP },
  { row: 12, column: 14, side: RIGHT },
  { row: 13, column: 0, side: DOWN },
  { row: 14, column: 2, side: LEFT },
  { row: 14, column: 2, side: UP },
  { row: 14, column: 11, side: LEFT },
  { row: 14, column: 11, side: DOWN },
  { row: 15, column: 5, side: RIGHT },
  { row: 15, column: 13, side: RIGHT },
];

let targets = [
  { row: 1, column: 5, color: BLUE_TARGET, shape: CRICLE_TARGET },
  { row: 2, column: 7, color: WILD_TARGET, shape: VORTEX_TARGET },
  { row: 2, column: 11, color: RED_TARGET, shape: SQUARE_TARGET },
  { row: 3, column: 13, color: YELLOW_TARGET, shape: CRICLE_TARGET },
  { row: 4, column: 3, color: RED_TARGET, shape: HEXAGON_TARGET },
  { row: 4, column: 10, color: GREEN_TARGET, shape: HEXAGON_TARGET },
  { row: 5, column: 6, color: GREEN_TARGET, shape: SQUARE_TARGET },
  { row: 5, column: 12, color: BLUE_TARGET, shape: TRIANGLE_TARGET },
  { row: 6, column: 1, color: YELLOW_TARGET, shape: TRIANGLE_TARGET },
  { row: 9, column: 3, color: YELLOW_TARGET, shape: HEXAGON_TARGET },
  { row: 9, column: 12, color: BLUE_TARGET, shape: HEXAGON_TARGET },
  { row: 10, column: 10, color: YELLOW_TARGET, shape: SQUARE_TARGET },
  { row: 11, column: 1, color: RED_TARGET, shape: CRICLE_TARGET },
  { row: 12, column: 6, color: BLUE_TARGET, shape: SQUARE_TARGET },
  { row: 12, column: 14, color: RED_TARGET, shape: TRIANGLE_TARGET },
  { row: 14, column: 2, color: GREEN_TARGET, shape: TRIANGLE_TARGET },
  { row: 14, column: 11, color: GREEN_TARGET, shape: CRICLE_TARGET },
];

gameGrid.setWalls(walls);
gameGrid.setTargets(targets);
gameGrid.initializedRobotPositions();

function loadApp() {
  console.log('loadApp called.');
}
