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

function setupRobotBoard() {
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
  gameGrid.pickNextTarget();

  return gameGrid;
}

function testMovesForRobots() {
  let gameGrid = setupRobotBoard();

  gameGrid._setRobotPostion(RED_ROBOT, 10, 9);
  gameGrid._setRobotPostion(YELLOW_ROBOT, 10, 10);
  gameGrid._setRobotPostion(BLUE_ROBOT, 14, 15);
  gameGrid._setRobotPostion(GREEN_ROBOT, 15, 15);

  let possibleMovesForRed = gameGrid.movesForRobot(RED_ROBOT);
  if (!possibleMovesForRed.includes(MOVE_UP)) {
    console.log('ERROR RED CAN MOVE UP!');
  }
  if (possibleMovesForRed.includes(MOVE_RIGHT)) {
    console.log('ERROR RED SHOULD NOT MOVE RIGHT');
  }
  if (!possibleMovesForRed.includes(MOVE_DOWN)) {
    console.log('ERROR RED CAN MOVE DOWN!');
  }
  if (!possibleMovesForRed.includes(MOVE_LEFT)) {
    console.log('ERROR RED CAN MOVE LEFT!');
  }

  let possibleMovesForYellow = gameGrid.movesForRobot(YELLOW_ROBOT);
  if (possibleMovesForYellow.includes(MOVE_DOWN)) {
    console.log('ERROR YELLOW CANNOT MOVE DOWN');
  }
  if (possibleMovesForYellow.includes(MOVE_LEFT)) {
    console.log('ERROR YELLOW CANNOT MOVE LEFT');
  }
  if (possibleMovesForYellow.includes(MOVE_RIGHT)) {
    console.log('ERROR YELLOW CANNOT MOVE RIGHT');
  }
  if (!possibleMovesForYellow.includes(MOVE_UP)) {
    console.log('ERROR YELLOW SHOULD UP');
  }

  let possibleMovesForBlue = gameGrid.movesForRobot(BLUE_ROBOT);
  if (!possibleMovesForBlue.includes(MOVE_UP)) {
    console.log('ERROR BLUE CAN MOVE UP');
  }
  if (possibleMovesForBlue.includes(MOVE_DOWN)) {
    console.log('ERROR BLUE CANNOT MOVE DOWN RIGHT');
  }
  if (!possibleMovesForBlue.includes(MOVE_LEFT)) {
    console.log('ERROR BLUE CAN MOVE LEFT');
  }
  if (possibleMovesForBlue.includes(MOVE_RIGHT)) {
    console.log('ERROR BLUE CANNOT MOVE RIGHT');
  }

  let possibleMovesForGreen = gameGrid.movesForRobot(GREEN_ROBOT);
  if (possibleMovesForGreen.includes(MOVE_DOWN)) {
    console.log('ERROR GREEN CANNOT MOVE DOWN');
  }
  if (!possibleMovesForGreen.includes(MOVE_LEFT)) {
    console.log('ERROR GREEN CAN MOVE LEFT');
  }
  if (possibleMovesForGreen.includes(MOVE_RIGHT)) {
    console.log('ERROR GREEN CANNOT MOVE RIGHT');
  }
  if (possibleMovesForGreen.includes(MOVE_UP)) {
    console.log('ERROR GREEN CANNOT MOVE RIGHT');
  }
}

function testMoveRobot() {
  let gameGrid = setupRobotBoard();

  gameGrid._setRobotPostion(RED_ROBOT, 12, 6);
  gameGrid._setRobotPostion(YELLOW_ROBOT, 12, 3);
  gameGrid._setRobotPostion(BLUE_ROBOT, 7, 4);
  gameGrid._setRobotPostion(GREEN_ROBOT, 10, 14);

  let initialRowForYellow = gameGrid.robots[YELLOW_ROBOT].row;
  let initialColumnForYellow = gameGrid.robots[YELLOW_ROBOT].column;
  gameGrid.moveRobot(YELLOW_ROBOT, MOVE_RIGHT);
  let rowForYellow = gameGrid.robots[YELLOW_ROBOT].row;
  let columnForYellow = gameGrid.robots[YELLOW_ROBOT].column;
  if (rowForYellow !== 12) {
    console.log(`ERROR ON MOVE_RIGHT: expected ${rowForYellow} to be 12`);
  }
  if (columnForYellow !== 5) {
    console.log(`ERROR ON MOVE_RIGHT: expected ${columnForYellow} to be 5`);
  }
  if (gameGrid.getValue(rowForYellow, columnForYellow) !== ROBOT_CELL) {
    console.log(
      `ERROR ON CELL AFTER RIGHT ${gameGrid.getValue(
        rowForYellow,
        columnForYellow
      )} is expected to be ROBOT_CELL`
    );
  }
  if (
    gameGrid.getValue(initialRowForYellow, initialColumnForYellow) !==
    EMPTY_CELL
  ) {
    console.log(
      `ERROR ON INITIAL CELL AFTER RIGHT ${gameGrid.getValue(
        initialRowForYellow,
        initialColumnForYellow
      )} is expected to be EMPTY_CELL`
    );
  }

  let initialRowForGreen = gameGrid.robots[GREEN_ROBOT].row;
  let initialColumnForGreen = gameGrid.robots[GREEN_ROBOT].column;
  gameGrid.moveRobot(GREEN_ROBOT, MOVE_RIGHT);
  let rowForGreen = gameGrid.robots[GREEN_ROBOT].row;
  let columnForGreen = gameGrid.robots[GREEN_ROBOT].column;
  if (rowForGreen !== 10) {
    console.log(`ERROR ON MOVE_RIGHT: expected ${rowForGreen} to be 10`);
  }
  if (columnForGreen !== 15) {
    console.log(`ERROR ON MOVE_RIGHT: expected ${columnForGreen} to be 15`);
  }
  if (gameGrid.getValue(rowForGreen, columnForGreen) !== ROBOT_CELL) {
    console.log(
      `ERROR ON CELL AFTER RIGHT ${gameGrid.getValue(
        rowForGreen,
        columnForGreen
      )} is expected to be ROBOT_CELL`
    );
  }
  if (
    gameGrid.getValue(initialRowForGreen, initialColumnForGreen) !== EMPTY_CELL
  ) {
    console.log(
      `ERROR ON INITIAL CELL AFTER RIGHT ${gameGrid.getValue(
        initialRowForGreen,
        initialColumnForGreen
      )} is expected to be EMPTY_CELL`
    );
  }

  let previousRow = gameGrid.robots[GREEN_ROBOT].row;
  let previousColumn = gameGrid.robots[GREEN_ROBOT].column;
  gameGrid.moveRobot(GREEN_ROBOT, MOVE_LEFT);
  rowForGreen = gameGrid.robots[GREEN_ROBOT].row;
  columnForGreen = gameGrid.robots[GREEN_ROBOT].column;
  if (rowForGreen !== 10) {
    console.log(`ERROR ON MOVE_LEFT: expected ${rowForGreen} to be 10`);
  }
  if (columnForGreen !== 11) {
    console.log(`ERROR ON MOVE_LEFT: expected ${columnForGreen} to be 11`);
  }
  if (gameGrid.getValue(rowForGreen, columnForGreen) !== ROBOT_CELL) {
    console.log(
      `ERROR ON CELL AFTER LEFT ${gameGrid.getValue(
        rowForGreen,
        columnForGreen
      )} is expected to be ROBOT_CELL`
    );
  }
  if (gameGrid.getValue(previousRow, previousColumn) !== EMPTY_CELL) {
    console.log(
      `ERROR ON INITIAL CELL AFTER RIGHT ${gameGrid.getValue(
        previousRow,
        previousColumn
      )} is expected to be EMPTY_CELL`
    );
  }

  previousRow = gameGrid.robots[GREEN_ROBOT].row;
  previousColumn = gameGrid.robots[GREEN_ROBOT].column;
  gameGrid.moveRobot(GREEN_ROBOT, MOVE_UP);
  rowForGreen = gameGrid.robots[GREEN_ROBOT].row;
  columnForGreen = gameGrid.robots[GREEN_ROBOT].column;
  if (rowForGreen !== 3) {
    console.log(`ERROR ON MOVE_UP: expected ${rowForGreen} to be 3`);
  }
  if (columnForGreen !== 11) {
    console.log(`ERROR ON MOVE_UP: expected ${columnForGreen} to be 11`);
  }
  if (gameGrid.getValue(rowForGreen, columnForGreen) !== ROBOT_CELL) {
    console.log(
      `ERROR ON CELL AFTER UP ${gameGrid.getValue(
        rowForGreen,
        columnForGreen
      )} is expected to be ROBOT_CELL`
    );
  }
  if (gameGrid.getValue(previousRow, previousColumn) !== EMPTY_CELL) {
    console.log(
      `ERROR ON INITIAL CELL AFTER RIGHT ${gameGrid.getValue(
        previousRow,
        previousColumn
      )} is expected to be EMPTY_CELL`
    );
  }

  previousRow = gameGrid.robots[GREEN_ROBOT].row;
  previousColumn = gameGrid.robots[GREEN_ROBOT].column;
  gameGrid.moveRobot(GREEN_ROBOT, MOVE_DOWN);
  rowForGreen = gameGrid.robots[GREEN_ROBOT].row;
  columnForGreen = gameGrid.robots[GREEN_ROBOT].column;
  if (rowForGreen !== 14) {
    console.log(`ERROR ON MOVE_DOWN: expected ${rowForGreen} to be 14`);
  }
  if (columnForGreen !== 11) {
    console.log(`ERROR ON MOVE_DOWN: expected ${rowForGreen} to be 11`);
  }
  if (gameGrid.getValue(rowForGreen, columnForGreen) !== ROBOT_CELL) {
    console.log(
      `ERROR ON CELL AFTER DOWN ${gameGrid.getValue(
        rowForGreen,
        columnForGreen
      )} is expected to be ROBOT_CELL`
    );
  }
  if (gameGrid.getValue(previousRow, previousColumn) !== EMPTY_CELL) {
    console.log(
      `ERROR ON INITIAL CELL AFTER RIGHT ${gameGrid.getValue(
        previousRow,
        previousColumn
      )} is expected to be EMPTY_CELL`
    );
  }
}

function loadApp() {
  setupRobotBoard();
  testMovesForRobots();
  testMoveRobot();
  console.log('loadApp called.');
}
