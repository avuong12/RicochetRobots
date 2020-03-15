class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
  }

  draw() {}
}

function loadApp() {
  let ricochetRobots = new RicochetRobots();
  ricochetRobots.draw();
}
