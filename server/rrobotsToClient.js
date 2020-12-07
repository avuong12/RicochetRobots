const Grid = require('./rrobotsGridToClient');
const { Walls, Targets } = require('./boardElementstoClient');

class RicochetRobots {
  constructor() {
    this.board = new Grid(16, 16);
    this.board.setWalls(Walls);
    this.board.setTargets(Targets);
    this.board.selectedRobotColor = undefined;
    this.initalRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    this.pathCellArray = [];
    this.currentTimer = undefined;
    this.winnerOfAuction = undefined;
    this.allowToMove = false;
    this.steps = 0;
  }

  selectNewTarget() {
    // get a candidate for the next target. Do not set currentTarget;
    let nextTargetCandidate = this.board.pickNextTargetCandidate();
    // send candidate target to server.
    if (!nextTargetCandidate) {
      // game is over. Have server declare a winner.
      return false;
    }
    // returns nextTargetCandidate to the server.
    return nextTargetCandidate;
  }

  selectedRobot(selectedRobot) {
    this.board.selectedRobotColor = selectedRobot;
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
}
module.exports = RicochetRobots;
