const Grid = require('./rrobotsGridToClient');
const { Walls, Targets } = require('./boardElementstoClient');
const {
  MOVE_UP,
  MOVE_DOWN,
  MOVE_RIGHT,
  MOVE_LEFT,
} = require('./variables/moves');

class RicochetRobots {
  constructor() {
    this.board = new Grid(16, 16);
    this.board.setWalls(Walls);
    this.board.setTargets(Targets);
    this.selectedRobotColor = undefined;
    this.initalRobotsPositions = this.deepCopyRobots(this.board.getRobots());
    this.currentTarget = undefined;
    this.steps = 0;
    this.win;
  }

  selectNewTarget() {
    // get a candidate for the next target. Do not set currentTarget;
    let nextTargetCandidate = this.board.pickNextTargetCandidate();
    // send candidate target to server.
    console.log('next target:', nextTargetCandidate);
    if (!nextTargetCandidate) {
      console.log('there was no target');
      // game is over. Have server declare a winner.
      return false;
    }
    // returns nextTargetCandidate to the server.
    console.log('next target:', nextTargetCandidate);
    return nextTargetCandidate;
  }

  setCurrentTargetinGrid() {
    this.board.currentTarget = this.currentTarget;
  }

  getRobotsAsString() {
    return JSON.stringify(this.board.getRobots());
  }

  deepCopyRobots(object) {
    return JSON.parse(JSON.stringify(object));
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
    if (this.selectedRobotColor === undefined) {
      return false;
    }

    let robots = this.board.getRobots();
    let selectedRobot = robots[this.selectedRobotColor];
    const robotColor = selectedRobot.color;
    const possibleMoves = this.board.movesForRobot(robotColor);
    if (possibleMoves !== undefined && possibleMoves.includes(moveDirection)) {
      this.board.moveRobot(robotColor, moveDirection);
      this.steps++;
    }

    // Check to see if the robot reached the target spot.
    // TODO: check if target was reached when robot was moved.
    if (this.board.reachedTarget()) {
      return { direction: key, targetReached: true };
    }
    return { direction: key, targetReached: false };
  }

  storeTargets(target) {
    const targetColor = target.color;
    const targetShape = target.shape;
    this.board.wonTargets.add(`${targetColor}-${targetShape}`);
  }
}
module.exports = RicochetRobots;
