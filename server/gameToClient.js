class Game {
  constructor() {
    this.robots = undefined;
    this.currentTarget = undefined;
    this.targets = new Set();
    this.pickedTargets = [];
    this.selectedRobotColor = undefined;
    this.hasValidBid = false;
    this.bids = [];
    this.lowestBidSoFar = undefined;
    this.lowestBidderSoFar = undefined;
    this.winnerOfAuction = undefined;
    this.wonTargets = new Set();
    this.claimedTargets = {};
    this.usernames = new Set();
    this.socketIdToUsername = {};
    this.usernameToSocketId = {};
    this.chats = [];
  }

  setNewGame() {
    this.targets = new Set();
    this.pickedTargets = [];
    this.lowestBidSoFar = undefined;
    this.lowestBidderSoFar = undefined;
    this.claimedTargets = {};
  }

  setInitialRobotPositions(robotPositions) {
    this.robots = robotPositions;
  }
}

module.exports = Game;
