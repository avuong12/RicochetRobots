class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
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
      }
      if (targetColor === GREEN_TARGET) {
        targetSpan.classList.toggle('green-target');
      }
      if (targetColor === BLUE_TARGET) {
        targetSpan.classList.toggle('blue-target');
      }
      if (targetColor === YELLOW_TARGET) {
        targetSpan.classList.toggle('yellow-target');
      }
      if (targetColor === WILD_TARGET) {
        targetSpan.classList.toggle('wild-target');
      }

      if (targetShape === SQUARE_TARGET) {
        targetSpan.classList.toggle('square-target');
      }

      let cellSpan = document.getElementById(`${targetRow}, ${targetColumn}`);
      cellSpan.appendChild(targetSpan);
    }
  }
}

function loadApp() {
  let ricochetRobots = new RicochetRobots();
  ricochetRobots.draw(document.getElementById('grid-canvas'));
}
