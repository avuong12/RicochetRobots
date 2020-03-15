class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
  }

  draw(parentNode) {
    parentNode.innerHTML = 'draw called';

    for (let r = 0; r < this.board.getRows(); r++) {
      let newDiv = document.createElement('div');
      for (let c = 0; c < this.board.getColumns(); c++) {
        let newSpan = document.createElement('span');
        newSpan.id = `${r},${c}`;
        newDiv.appendChild(newSpan);
      }
      parentNode.appendChild(newDiv);
    }
  }
}

function loadApp() {
  let ricochetRobots = new RicochetRobots();
  ricochetRobots.draw(document.getElementById('grid-canvas'));
}
