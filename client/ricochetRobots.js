const robotIdMap = {};
robotIdMap[GREEN_ROBOT] = 'green-robot';
robotIdMap[RED_ROBOT] = 'red-robot';
robotIdMap[BLUE_ROBOT] = 'blue-robot';
robotIdMap[YELLOW_ROBOT] = 'yellow-robot';

const pathIdMap = {};
pathIdMap[GREEN_ROBOT] = 'traveled-green-cell';
pathIdMap[RED_ROBOT] = 'traveled-red-cell';
pathIdMap[BLUE_ROBOT] = 'traveled-blue-cell';
pathIdMap[YELLOW_ROBOT] = 'traveled-yellow-cell';

class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
    this.board.selectedRobotColor = undefined;
    this.initalRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    this.currentTimer = undefined;
  }

  selectNewTarget() {
    // Deselect
    this.toggleTargetHightlight();
    this.board.pickNextTarget();
    this.toggleTargetHightlight();
    this.clearPath();
    // initial robot position that can be reset to.
    this.initalRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    // Reset the time.
    this.currentTimer = undefined;
  }

  toggleTargetHightlight() {
    let target = this.board.getCurrentTarget();
    let targetRow = target.row;
    let targetColumn = target.column;
    let targetCell = document.getElementById(`${targetRow}, ${targetColumn}`);
    targetCell.classList.toggle('target-cell');
  }

  moveSelectedRobot(direction) {
    if (this.board.selectedRobotColor === undefined) {
      return;
    }

    // Remove the robot span and move it to the new position.
    // get the cell that contains the robot removeChild.
    let robotSpan = document.getElementById(
      `${robotIdMap[this.board.selectedRobotColor]}`
    );
    robotSpan.parentNode.removeChild(robotSpan);

    // when there is a selected robot.
    this.board.moveRobot(this.board.selectedRobotColor, direction);

    // move it to the span it belongs to.
    let robots = this.board.getRobots();
    let row = robots[this.board.selectedRobotColor].row;
    let column = robots[this.board.selectedRobotColor].column;
    let cellSpan = document.getElementById(`${row}, ${column}`);
    cellSpan.appendChild(robotSpan);
  }

  tracePath(startCell, direction, endCell, color) {
    // array of the row/column pair that needs to be colored.
    let cellArray = [];
    let currentRow = startCell.row;
    let endRow = endCell.row;
    let currentColumn = startCell.column;
    let endColumn = endCell.column;
    // if direction is MOVE_UP, row is decremented.
    if (direction === MOVE_UP) {
      while (currentRow >= endRow) {
        cellArray.push({ row: currentRow, column: endColumn });
        currentRow--;
      }
    }
    // if direction is MOVE_DOWN, row is incremented.
    else if (direction === MOVE_DOWN) {
      while (currentRow <= endRow) {
        cellArray.push({ row: currentRow, column: endColumn });
        currentRow++;
      }
    }
    // if direction is MOVE_LEFT, column is decremented.
    else if (direction === MOVE_LEFT) {
      while (currentColumn >= endColumn) {
        cellArray.push({ row: endRow, column: currentColumn });
        currentColumn--;
      }
    }
    // if direction is MOVE_RIGHT, coilumn is incremented.
    else if (direction === MOVE_RIGHT) {
      while (currentColumn <= endColumn) {
        cellArray.push({ row: endRow, column: currentColumn });
        currentColumn++;
      }
    }

    // draw traveled cells.
    for (let i = 0; i < cellArray.length; i++) {
      let cellSpan = document.getElementById(
        `${cellArray[i].row}, ${cellArray[i].column}`
      );
      cellSpan.classList.remove('traveled-blue-cell');
      cellSpan.classList.remove('traveled-green-cell');
      cellSpan.classList.remove('traveled-red-cell');
      cellSpan.classList.remove('traveled-yellow-cell');
      cellSpan.classList.add(`${pathIdMap[color]}`);
    }

    // TODO: in reset function. clear cells.
  }

  keyboardHandler(key) {
    let moveDirection = null;
    if (key === 'ArrowUp') {
      moveDirection = MOVE_UP;
    } else if (key === 'ArrowDown') {
      moveDirection = MOVE_DOWN;
    } else if (key === 'ArrowLeft') {
      moveDirection = MOVE_LEFT;
    } else if (key === 'ArrowRight') {
      moveDirection = MOVE_RIGHT;
    }
    // start cell.
    if (this.board.selectedRobotColor === undefined) {
      return;
    }

    let robots = this.board.getRobots();
    let selectedRobot = robots[this.board.selectedRobotColor];
    const startRow = selectedRobot.row;
    const startColumn = selectedRobot.column;
    const startCell = { row: startRow, column: startColumn };

    this.moveSelectedRobot(moveDirection);

    // end cell.
    let robotsAfterMove = this.board.getRobots();
    let selectedRobotMoved = robotsAfterMove[this.board.selectedRobotColor];
    const selectedRobotColor = selectedRobotMoved.color;
    const endRow = selectedRobotMoved.row;
    const endColumn = selectedRobotMoved.column;
    const endCell = { row: endRow, column: endColumn };

    this.tracePath(startCell, moveDirection, endCell, selectedRobotColor);
  }

  getRobotsAsString() {
    return JSON.stringify(this.board.getRobots());
  }

  deepCopyRobots(object) {
    return JSON.parse(JSON.stringify(object));
  }

  solveBFS() {
    let initalRobots = this.deepCopyRobots(this.board.getRobots());
    let visited = new Set();
    let queue = [{ robots: initalRobots, depth: 0, path: [] }];

    while (queue.length > 0) {
      let currentState = queue.shift();
      let currentRobots = currentState.robots;
      let currentDepth = currentState.depth;
      visited.add(currentRobots);

      // This moves the robots to the state that is being looked at.
      this.board.moveAllRobots(currentRobots);

      // Check if final target has been reached.
      if (this.board.reachedTarget()) {
        // This resets the board to the initial condition.
        this.board.moveAllRobots(initalRobots);
        this.drawPath(currentState.path);
        return currentState.path;
      }

      // Going through all the neighbors.
      // Keys are the robots by color. Has color, row, and column
      for (let key in currentRobots) {
        let movesForRobot = this.board.movesForRobot(currentRobots[key].color);
        for (let i = 0; i < movesForRobot.length; i++) {
          this.board.moveRobot(currentRobots[key].color, movesForRobot[i]);
          let newRobotPostions = this.deepCopyRobots(this.board.getRobots());
          if (!visited.has(newRobotPostions)) {
            queue.push({
              robots: newRobotPostions,
              depth: currentDepth + 1,
              path: [
                ...currentState.path,
                {
                  robot: currentRobots[key].color,
                  direction: movesForRobot[i],
                },
              ],
            });
          }
          // reset robot position for the next neighbor.
          this.board.moveAllRobots(currentRobots);
        }
      }
    }
    // resets the board.
    this.board.moveAllRobots(initalRobots);
    return false;
  }

  dfs(maxDepth) {
    let initalRobots = this.deepCopyRobots(this.board.getRobots());
    let visited = new Set();
    let stack = [{ robots: initalRobots, depth: 0, path: [] }];
    while (stack.length > 0) {
      let currentState = stack.pop();
      let currentRobots = currentState.robots;
      let currentDepth = currentState.depth;
      visited.add(currentRobots);

      // reset the robot position for the next neighbor.
      this.board.moveAllRobots(currentRobots);

      // Check if final target has been reached.
      if (this.board.reachedTarget()) {
        this.board.moveAllRobots(initalRobots);
        return currentState.path;
      }

      if (currentDepth >= maxDepth) {
        continue;
      }

      for (let key in currentRobots) {
        let movesForRobot = this.board.movesForRobot(currentRobots[key].color);
        for (let i = 0; i < movesForRobot.length; i++) {
          this.board.moveRobot(currentRobots[key].color, movesForRobot[i]);
          let newRobotPostions = this.deepCopyRobots(this.board.getRobots());
          this.board.moveAllRobots(currentRobots);
          if (!visited.has(newRobotPostions)) {
            stack.push({
              robots: newRobotPostions,
              depth: currentDepth + 1,
              path: [
                ...currentState.path,
                {
                  robot: currentRobots[key].color,
                  direction: movesForRobot[i],
                },
              ],
            });
          }
        }
      }
    }

    // There is no path.
    this.board.moveAllRobots(initalRobots);
    return null;
  }

  // iterative deeping DFS to find the shortness path.
  // Increments maxDepth when there is no path at current maxDepth (similar to BFS).
  solveDFS() {
    for (let maxDepth = 0; maxDepth <= 10; maxDepth++) {
      let path = this.dfs(maxDepth);
      if (path) {
        this.drawPath(path);
        return path;
      }
    }
    return null;
  }

  clearPath() {
    let parentNode = document.getElementById('path-solution');
    parentNode.innerHTML = '';
  }

  resetPositions() {
    // For referencing robots.
    const robotSpans = {};

    let robots = this.board.getRobots();
    for (let key in robots) {
      let robotColor = robots[key].color;

      // Remove the robots from the DOM.
      let robotSpan = document.getElementById(`${robotIdMap[key]}`);
      robotSpan.parentNode.removeChild(robotSpan);
      robotSpans[robotColor] = robotSpan;
    }

    // get the inital positions of the robots when a newtarget is selected.
    this.board.moveAllRobots(this.initalRobotsPositions);

    // move the robots to the initial positions in the DOM.
    for (let key in this.initalRobotsPositions) {
      let row = this.initalRobotsPositions[key].row;
      let column = this.initalRobotsPositions[key].column;
      let color = this.initalRobotsPositions[key].color;

      // Draw the robot to the cell.
      let cellSpan = document.getElementById(`${row}, ${column}`);
      cellSpan.appendChild(robotSpans[color]);
    }

    // remove traveled cells on the board.
    for (let r = 0; r < this.board.getRows(); r++) {
      // let newDiv = document.createElement('div');
      // newDiv.classList.toggle('grid-row');
      for (let c = 0; c < this.board.getColumns(); c++) {
        let cellSpan = document.getElementById(`${r}, ${c}`);
        cellSpan.classList.remove('traveled-blue-cell');
        cellSpan.classList.remove('traveled-green-cell');
        cellSpan.classList.remove('traveled-red-cell');
        cellSpan.classList.remove('traveled-yellow-cell');
      }
    }
  }

  oneMinuteTimer() {
    const updateTimer = () => {
      let timerDiv = document.getElementById('timer');

      if (this.currentTimer === undefined) {
        timerDiv.innerHTML = '';
        return;
      }
      // Subsequent time after the timer was pressed.
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 60 - (currentTime - this.currentTimer);
      if (secondsRemaining === 60) {
        timerDiv.innerHTML = '1:00 min';
        //
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 60 && secondsRemaining >= 10) {
        timerDiv.innerHTML = `0:${secondsRemaining} sec`;
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 10 && secondsRemaining > 0) {
        timerDiv.innerHTML = `0:0${secondsRemaining} sec`;
        window.requestAnimationFrame(updateTimer);
      } else {
        timerDiv.innerHTML = '';
        alert('Time is Up! Bidder, Reveal the Path.');
      }
    };
    // Tracks the time in which the timer was pressed.
    this.currentTimer = Math.floor(Date.now() / 1000);
    // oneMinuteTimer is return. RequestAnimation is called once.
    window.requestAnimationFrame(updateTimer);
  }

  drawPath(path) {
    // Draw empty cells for the board.
    this.clearPath();
    let parentNode = document.getElementById('path-solution');
    let newDiv = document.createElement('div');
    newDiv.classList.toggle('grid-row');
    for (let i = 0; i < path.length; i++) {
      let robotColor = path[i].robot;
      let direction = path[i].direction;
      let cellSpan = document.createElement('span');

      // Draw cell.
      cellSpan.classList.toggle('grid-cell');
      cellSpan.classList.toggle('empty-grid-cell');

      // Draw robot.
      let robotSpan = document.createElement('span');
      robotSpan.classList.toggle('robot');
      if (robotColor === GREEN_ROBOT) {
        robotSpan.classList.toggle('green-robot');
      } else if (robotColor === BLUE_ROBOT) {
        robotSpan.classList.toggle('blue-robot');
      } else if (robotColor === RED_ROBOT) {
        robotSpan.classList.toggle('red-robot');
      } else if (robotColor === YELLOW_ROBOT) {
        robotSpan.classList.toggle('yellow-robot');
      }

      // Draw arrows.
      let arrowSpan = document.createElement('span');
      arrowSpan.classList.toggle('arrow');
      if (direction === MOVE_UP) {
        arrowSpan.classList.toggle('up-arrow');
      } else if (direction === MOVE_DOWN) {
        arrowSpan.classList.toggle('down-arrow');
      } else if (direction === MOVE_LEFT) {
        arrowSpan.classList.toggle('left-arrow');
      } else if (direction === MOVE_RIGHT) {
        arrowSpan.classList.toggle('right-arrow');
      }

      robotSpan.appendChild(arrowSpan);
      cellSpan.appendChild(robotSpan);
      newDiv.appendChild(cellSpan);
    }
    parentNode.appendChild(newDiv);
  }

  draw(parentNode) {
    // Draw empty cells for the board.
    for (let r = 0; r < this.board.getRows(); r++) {
      let newDiv = document.createElement('div');
      newDiv.classList.toggle('grid-row');
      for (let c = 0; c < this.board.getColumns(); c++) {
        let newSpan = document.createElement('span');
        newSpan.id = `${r}, ${c}`;

        // Draw cell.
        newSpan.classList.toggle('grid-cell');
        if (this.board.getValue(r, c) === INACCESSABLE_CELL) {
          newSpan.classList.toggle('inaccessable-grid-cell');
        } else {
          newSpan.classList.toggle('empty-grid-cell');
        }

        // Draw walls.
        let cellWalls = this.board.getWalls(r, c);
        if (cellWalls.includes(UP)) {
          newSpan.classList.toggle('top-wall');
        }
        if (cellWalls.includes(DOWN)) {
          newSpan.classList.toggle('bottom-wall');
        }
        if (cellWalls.includes(LEFT)) {
          newSpan.classList.toggle('left-wall');
        }
        if (cellWalls.includes(RIGHT)) {
          newSpan.classList.toggle('right-wall');
        }

        newDiv.appendChild(newSpan);
      }
      parentNode.appendChild(newDiv);
    }

    // Draw targets.
    let targets = this.board.getTargets();
    for (let i = 0; i < targets.length; i++) {
      let targetRow = targets[i].row;
      let targetColumn = targets[i].column;
      let targetColor = targets[i].color;
      let targetShape = targets[i].shape;

      let targetSpan = document.createElement('span');

      if (targetColor === RED_TARGET) {
        targetSpan.classList.toggle('red-target');
      } else if (targetColor === GREEN_TARGET) {
        targetSpan.classList.toggle('green-target');
      } else if (targetColor === BLUE_TARGET) {
        targetSpan.classList.toggle('blue-target');
      } else if (targetColor === YELLOW_TARGET) {
        targetSpan.classList.toggle('yellow-target');
      } else if (targetColor === WILD_TARGET) {
        targetSpan.classList.toggle('wild-target');
      }

      if (targetShape === SQUARE_TARGET) {
        targetSpan.classList.toggle('square-target');
      } else if (targetShape === CRICLE_TARGET) {
        targetSpan.classList.toggle('circle-target');
      } else if (targetShape === TRIANGLE_TARGET) {
        targetSpan.classList.toggle('triangle-target');
      } else if (targetShape === HEXAGON_TARGET) {
        targetSpan.classList.toggle('hexagon-target');
      } else if (targetShape === VORTEX_TARGET) {
        targetSpan.classList.toggle('vortex-target');
      }

      let cellSpan = document.getElementById(`${targetRow}, ${targetColumn}`);
      cellSpan.appendChild(targetSpan);
    }

    // Draw Robots
    let robots = this.board.getRobots();
    for (let key in robots) {
      let robotRowPosition = robots[key].row;
      let robotColumnPosition = robots[key].column;
      let robotColor = robots[key].color;

      let robotSpan = document.createElement('span');
      robotSpan.classList.toggle('robot');

      robotSpan.addEventListener('mouseup', (event) => {
        // Deselect the previously selected robot.
        if (this.board.selectedRobotColor !== undefined) {
          let robotId = robotIdMap[this.board.selectedRobotColor];
          let selectedRobotSpan = document.getElementById(robotId);
          selectedRobotSpan.classList.toggle('selected-robot');
        }

        // Select a clicked robot.
        event.target.classList.toggle('selected-robot');
        if (event.target.id === 'green-robot') {
          this.board.selectedRobotColor = GREEN_ROBOT;
        } else if (event.target.id === 'red-robot') {
          this.board.selectedRobotColor = RED_ROBOT;
        } else if (event.target.id === 'blue-robot') {
          this.board.selectedRobotColor = BLUE_ROBOT;
        } else if (event.target.id === 'yellow-robot') {
          this.board.selectedRobotColor = YELLOW_ROBOT;
        }
      });

      if (robotColor === GREEN_ROBOT) {
        robotSpan.id = 'green-robot';
        robotSpan.classList.toggle('green-robot');
      } else if (robotColor === RED_ROBOT) {
        robotSpan.id = 'red-robot';
        robotSpan.classList.toggle('red-robot');
      } else if (robotColor === BLUE_ROBOT) {
        robotSpan.id = 'blue-robot';
        robotSpan.classList.toggle('blue-robot');
      } else if (robotColor === YELLOW_ROBOT) {
        robotSpan.id = 'yellow-robot';
        robotSpan.classList.toggle('yellow-robot');
      }

      let cellSpan = document.getElementById(
        `${robotRowPosition}, ${robotColumnPosition}`
      );
      cellSpan.appendChild(robotSpan);
    }

    // Hightlight current target cell.
    this.toggleTargetHightlight();
  }
}

let ricochetRobots = undefined;
function loadApp() {
  ricochetRobots = new RicochetRobots();
  ricochetRobots.draw(document.getElementById('grid-canvas'));
  document.addEventListener('keydown', (event) => {
    ricochetRobots.keyboardHandler(event.key);
  });
}