const robotIdMap = {};
robotIdMap[GREEN_ROBOT] = 'green-robot';
robotIdMap[RED_ROBOT] = 'red-robot';
robotIdMap[BLUE_ROBOT] = 'blue-robot';
robotIdMap[YELLOW_ROBOT] = 'yellow-robot';

class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
    this.board.selectedRobotColor = undefined;
  }

  selectNewTarget() {
    // Deselect
    this.toggleTargetHightlight();
    this.board.pickNextTarget();
    this.toggleTargetHightlight();
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
    // get the cell the contains the robot removeChild.
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
    this.moveSelectedRobot(moveDirection);
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
        console.log('path:', currentState.path);
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
        console.log('path:', path);
        this.drawPath(path);
        return path;
      }
    }
    return null;
  }

  // draw the path.
  // drawPath(path) {
  //   let parentNode = document.getElementById('path-solution');
  //   if (path === null) {
  //     return null;
  //   }
  //   let pathDiv = document.createElement('div');
  //   for (let i = 0; i < path.length; i++) {
  //     let robotColor = path[i].robot;
  //     let direction = path[i].direction;
  //     let newDirectionSpan = document.createElement('span');
  //     newDirectionSpan.id = `cell-${i}`;

  //     if (robotColor === GREEN_ROBOT) {
  //       newDirectionSpan.classList.toggle('green-path');
  //     } else if (robotColor === BLUE_ROBOT) {
  //       newDirectionSpan.classList.toggle('blue-path');
  //     } else if (robotColor === RED_ROBOT) {
  //       newDirectionSpan.classList.toggle('red-path');
  //     } else if (robotColor === YELLOW_ROBOT) {
  //       newDirectionSpan.classList.toggle('yellow-path');
  //     }

  //     // if (direction === MOVE_UP) {
  //     //   newDirectionSpan.classList.toggle('up-direction');
  //     // } else if (direction === MOVE_DOWN) {
  //     //   newDirectionSpan.classList.toggle('down-direction');
  //     // } else if (direction === MOVE_LEFT) {
  //     //   newDirectionSpan.classList.toggle('left-direction');
  //     // } else if (direction === MOVE_RIGHT) {
  //     //   newDirectionSpan.classList.toggle('right-direction');
  //     // }

  //     pathDiv.appendChild(newDirectionSpan);
  //   }
  //   parentNode.appendChild(pathDiv);
  // }

  drawPath(path) {
    // Draw empty cells for the board.
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
