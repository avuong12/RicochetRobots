class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
  }

  draw() {}
}

function loadApp() {
  let ricochetRobots = new RicochetRobots();
  ricochetRobots.draw();
}
