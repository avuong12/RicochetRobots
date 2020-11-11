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
  constructor(socket) {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    //this.board.pickNextTarget();
    this.board.selectedRobotColor = undefined;
    this.initalRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    this.pathCellArray = [];
    this.currentTimer = undefined;
    this.socket = socket;
    this.lowestBidSoFar = undefined;
    this.lowestBidderSoFar = undefined;
    this.winnerOfAuction = undefined;
    this.allowToMove = false;
    this.steps = 0;
  }
  startNewGame() {
    // Reset the board.
    this.sendNewGame();
    this.getInitialRobotsPositions();
  }
  selectNewTarget() {
    // get a candidate for the next target. Do not set currentTarget;
    let nextTargetCandidate = this.board.pickNextTargetCandidate();
    // send candidate target to server.
    this.sendSelectedTarget(nextTargetCandidate);
  }

  getInitialRobotsPositions() {
    let robotsPositions = this.board.initializedRobotPositionsCandidate();
    this.sendInitialRobotsPositions(robotsPositions);
  }

  // Deselect the previousely selected robot.
  deselectRobot() {
    if (this.board.selectedRobotColor !== undefined) {
      let lastSelectedRobotId = robotIdMap[this.board.selectedRobotColor];
      let lastSelectedRobotSpan = document.getElementById(lastSelectedRobotId);
      lastSelectedRobotSpan.classList.toggle('selected-robot');
    }
    return false;
  }

  selectedRobot(selectedRobot) {
    let robotId = robotIdMap[selectedRobot];
    let newlySelectedRobot = document.getElementById(robotId);
    newlySelectedRobot.classList.toggle('selected-robot');
    this.board.selectedRobotColor = selectedRobot;
  }

  // Only allows the winner of the auction to select robots.
  selectRobot() {
    if (!this.allowToMove) {
      return;
    }
    document.addEventListener('mouseup', (event) => {
      if (event.target.id === 'green-robot' && this.allowToMove) {
        this.sendSelectedRobot(GREEN_ROBOT);
      } else if (event.target.id === 'red-robot' && this.allowToMove) {
        this.sendSelectedRobot(RED_ROBOT);
      } else if (event.target.id === 'blue-robot' && this.allowToMove) {
        this.sendSelectedRobot(BLUE_ROBOT);
      } else if (event.target.id === 'yellow-robot' && this.allowToMove) {
        this.sendSelectedRobot(YELLOW_ROBOT);
      }
    });
  }

  placeRobots() {
    let robots = this.board.getRobots();
    for (let key in robots) {
      let robotRowPosition = robots[key].row;
      let robotColumnPosition = robots[key].column;
      let robotColor = robots[key].color;

      let robotSpan = document.createElement('span');
      robotSpan.setAttribute('class', 'sr-only');
      robotSpan.textContent = 'R';
      robotSpan.classList.toggle('robot');

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
  }

  removeRobots() {
    // robots from previous game.
    let previousRobots = this.board.getRobots();
    for (let key in previousRobots) {
      let robotRowPosition = previousRobots[key].row;
      let robotColumnPosition = previousRobots[key].column;
      let robotColor = previousRobots[key].color;
      if (robotColumnPosition !== undefined && robotRowPosition !== undefined) {
        let cellSpan = document.getElementById(
          `${robotRowPosition}, ${robotColumnPosition}`
        );
        let robotSpan = document.getElementById(`${robotIdMap[robotColor]}`);
        cellSpan.removeChild(robotSpan);
        this.board.setValue(robotRowPosition, robotColumnPosition, EMPTY_CELL);
      }
    }
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
    let currentRow = startCell.row;
    let endRow = endCell.row;
    let currentColumn = startCell.column;
    let endColumn = endCell.column;
    // if direction is MOVE_UP, row is decremented.
    if (direction === MOVE_UP) {
      while (currentRow >= endRow) {
        this.pathCellArray.push({ row: currentRow, column: endColumn });
        currentRow--;
      }
    }
    // if direction is MOVE_DOWN, row is incremented.
    else if (direction === MOVE_DOWN) {
      while (currentRow <= endRow) {
        this.pathCellArray.push({ row: currentRow, column: endColumn });
        currentRow++;
      }
    }
    // if direction is MOVE_LEFT, column is decremented.
    else if (direction === MOVE_LEFT) {
      while (currentColumn >= endColumn) {
        this.pathCellArray.push({ row: endRow, column: currentColumn });
        currentColumn--;
      }
    }
    // if direction is MOVE_RIGHT, coilumn is incremented.
    else if (direction === MOVE_RIGHT) {
      while (currentColumn <= endColumn) {
        this.pathCellArray.push({ row: endRow, column: currentColumn });
        currentColumn++;
      }
    }

    // draw traveled cells.
    for (let i = 0; i < this.pathCellArray.length; i++) {
      let cellSpan = document.getElementById(
        `${this.pathCellArray[i].row}, ${this.pathCellArray[i].column}`
      );
      cellSpan.classList.remove('traveled-blue-cell');
      cellSpan.classList.remove('traveled-green-cell');
      cellSpan.classList.remove('traveled-red-cell');
      cellSpan.classList.remove('traveled-yellow-cell');
      cellSpan.classList.add(`${pathIdMap[color]}`);
    }
  }

  clearTracedPath() {
    for (let i = 0; i < this.pathCellArray.length; i++) {
      let cellSpan = document.getElementById(
        `${this.pathCellArray[i].row}, ${this.pathCellArray[i].column}`
      );
      cellSpan.classList.remove('traveled-blue-cell');
      cellSpan.classList.remove('traveled-green-cell');
      cellSpan.classList.remove('traveled-red-cell');
      cellSpan.classList.remove('traveled-yellow-cell');
    }
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
    // For tracing the path. Start cell.
    if (this.board.selectedRobotColor === undefined) {
      return;
    }
    let robots = this.board.getRobots();
    let selectedRobot = robots[this.board.selectedRobotColor];
    const robotColor = selectedRobot.color;
    const startRow = selectedRobot.row;
    const startColumn = selectedRobot.column;
    const startCell = { row: startRow, column: startColumn };

    // Check to see if the robot can make move before drawing path.
    const possibleMoves = this.board.movesForRobot(robotColor);
    if (possibleMoves !== undefined && possibleMoves.includes(moveDirection)) {
      this.moveSelectedRobot(moveDirection);
      this.drawMovingPath({
        robot: this.board.selectedRobotColor,
        direction: moveDirection,
      });
      this.steps++;
    }

    // For tracing the path. End cell.
    let robotsAfterMove = this.board.getRobots();
    let selectedRobotMoved = robotsAfterMove[this.board.selectedRobotColor];
    const selectedRobotColor = selectedRobotMoved.color;
    const endRow = selectedRobotMoved.row;
    const endColumn = selectedRobotMoved.column;
    const endCell = { row: endRow, column: endColumn };

    // Check to see if the robot reached the target spot.
    if (this.allowToMove && this.board.reachedTarget()) {
      if (this.steps <= this.lowestBidSoFar) {
        this.sendTargetHasBeenReached(
          this.steps,
          this.board.currentTarget,
          this.winnerOfAuction
        );
      } else {
        this.sendNextLowestBid();
      }
    }

    //this.tracePath(startCell, moveDirection, endCell, selectedRobotColor);
  }

  storeTargets(target) {
    const targetColor = target.color;
    const targetShape = target.shape;
    this.board.wonTargets.add(`${targetColor}-${targetShape}`);
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
        this.drawSolvedPath(currentState.path);
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
        this.drawSolvedPath(path);
        return path;
      }
    }
    return null;
  }

  clearPath() {
    this.steps = 0;
    let parentNode = document.getElementById('path-solution');
    parentNode.innerHTML = '';
  }

  requestResetPositions() {
    this.socket.emit('send_request_to_reset_positions', true);
    return false;
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
    this.clearTracedPath();
    this.clearPath();
  }

  drawMove(robotColor, direction, ele) {
    let cellSpan = document.createElement('span');

    // Draw cell.
    cellSpan.classList.toggle('grid-cell');
    cellSpan.classList.toggle('empty-grid-cell');

    // Draw robot.
    let robotSpan = document.createElement('span');
    robotSpan.classList.toggle('path');
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
    ele.appendChild(cellSpan);
  }

  drawSolvedPath(path) {
    // Draw empty cells for the board.
    let parentNode = document.getElementById('path-solution');
    let newDiv = document.createElement('div');
    newDiv.classList.toggle('grid-row');
    for (let i = 0; i < path.length; i++) {
      let robotColor = path[i].robot;
      let direction = path[i].direction;
      this.drawMove(robotColor, direction, newDiv);
    }
    parentNode.appendChild(newDiv);
  }

  drawMovingPath(path) {
    let parentNode = document.getElementById('path-solution');
    let newDiv = document.createElement('div');
    this.drawMove(path.robot, path.direction, newDiv);
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

    if (this.board.getCurrentTarget() !== undefined) {
      this.selectNewTarget();
    }
  }
  // Request the server to initiate a new game.
  sendNewGame() {
    this.socket.emit('send_new_game', true);
    return false;
  }

  // Request the server to let all players know the next target.
  sendSelectedTarget(targetCandidate) {
    this.socket.emit('send_selected_target', targetCandidate);
    return false;
  }

  // Request the server to let all players know the intial positions of the robots.
  sendInitialRobotsPositions(initialRobotsPositions) {
    this.socket.emit('send_inital_robots_positions', initialRobotsPositions);
    return false;
  }

  // Request the server to let all playsers know the selected robot.
  sendSelectedRobot(selectedRobot) {
    this.socket.emit('send_selectedRobot', selectedRobot);
    return false;
  }

  // Get the robot moves.
  sendKeyDirection(keyDirection) {
    if (!this.allowToMove) {
      return;
    }
    this.socket.emit('send_key_direction', keyDirection);
    return false;
  }

  // Send to server that the target has been reached.
  sendTargetHasBeenReached(steps, target, winner) {
    this.socket.emit('send_target_has_been_reached', steps, target, winner);
    return false;
  }

  sendNextLowestBid() {}

  setLowestBidUserInfo(user, bid) {
    this.lowestBidSoFar = bid;
    this.lowestBidderSoFar = user;
  }

  setupSocketHandlersForBoard() {
    // Receives initation from server to start a new game.
    this.socket.on('get_new_game', (data) => {
      // TODO: make separate function to start new game.
      if (data) {
        // clear the state of the board.
        this.allowToMove = false;
        this.lowestBidSoFar = undefined;
        this.lowestBidderSoFar = undefined;
        this.clearPath();
        this.clearTracedPath();
        // clear target
        if (this.board.getCurrentTarget() !== undefined) {
          this.toggleTargetHightlight();
          this.board.removeTarget();
        }

        // Deselect the robot of the previous game.
        this.deselectRobot();
        this.board.selectedRobotColor = undefined;
        this.initalRobotsPositions = undefined;

        // clear robots
        let robots = this.board.getRobots();
        if (robots[GREEN_ROBOT].row !== undefined) {
          this.removeRobots();
        }

        // clear won targets
        this.board.wonTargets.clear();
        // TODO: remove targets in scoreboard.
      }
    });

    // Receives the initial robots positions from server.
    this.socket.on('get_initial_robots_positions', (data) => {
      this.board.initializedRobotPositions(JSON.parse(data));
      this.placeRobots();
      this.initialRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    });

    // Receives next target from server.
    this.socket.on('get_selected_target', (data) => {
      // TODO: make separate function to get next target.
      if (data) {
        this.clearTracedPath();
        this.clearPath();
        // clear the state of the board.
        this.allowToMove = false;
        this.lowestBidSoFar = undefined;
        this.lowestBidderSoFar = undefined;
        this.winnerOfAuction = undefined;
        // deselect here.
        if (this.board.getCurrentTarget() !== undefined) {
          this.toggleTargetHightlight();
        }
        this.board.selectedTarget(data);
        this.toggleTargetHightlight();
        this.initalRobotsPositions = this.deepCopyRobots(
          this.board.getRobots()
        );
      }
    });

    // Receives the selected robot from server.
    this.socket.on('get_selected_robot', (data) => {
      this.deselectRobot();
      this.selectedRobot(data);
    });

    // Receives the direction of next move form server.
    this.socket.on('get_key_direction', (data) => {
      this.keyboardHandler(data);
    });

    // Receives request to reset positions from server.
    this.socket.on('get_reset_positions', (data) => {
      if (data) {
        this.resetPositions();
      }
    });

    // Receives lowest bid and lowest bidder from server.
    this.socket.on('lowest_bid_user', (userData, bidData) => {
      this.setLowestBidUserInfo(userData, bidData);
    });

    // Receives the winner of the auction from server.
    this.socket.on('get_winner_of_auction', (winner) => {
      this.winnerOfAuction = winner;
    });

    this.socket.on('get_user_to_reveal_path', (data) => {
      if (data) {
        if (this.winnerOfAuction === data) {
          this.winnerOfAuction = data;
          this.allowToMove = true;
          this.selectRobot();
        }
      }
    });

    // Receives the user that reached the target from server.
    this.socket.on('get_user_and_reached_target', (userData, targetData) => {
      this.storeTargets(targetData);
    });
  }
}

let ricochetRobots = undefined;
function loadApp() {
  ricochetRobots = new RicochetRobots(socket);

  ricochetRobots.draw(document.getElementById('grid-canvas'));
  ricochetRobots.setupSocketHandlersForBoard();
  document.addEventListener('keydown', (event) => {
    if (event.target.nodeName === 'BODY') {
      ricochetRobots.sendKeyDirection(event.key);
    }
  });
}
