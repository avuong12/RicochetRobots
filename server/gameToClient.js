class Game {
  constructor() {
    this.robots = undefined;
    this.currentTarget = undefined;
    // May not need targets or pickedTargets.
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
  }

  setInitialRobotPositions(robotPositions) {
    this.robots = robotPositions;
  }

  setCurrentTarget(targetCandidate) {
    if (this.wonTargets.has(targetCandidate)) {
      return false;
    }
    this.pickedTargets.push(targetCandidate);
    this.currentTarget = targetCandidate;
    this.bids = [];
    this.lowestBidSoFar = undefined;
    this.lowestBidderSoFar = undefined;
    this.winnerOfAuction = undefined;
    this.hasValidBid = false;
    return true;
  }

  addUser(socketId, name) {
    if (this.usernames.has(name)) {
      return false;
    }
    this.usernames.add(name);
    this.socketIdToUsername[socketId] = name;
    this.usernameToSocketId[name] = socketId;
    return this.socketIdToUsername;
  }

  submitBid(socketId, bid) {
    return { user: this.socketIdToUsername[socketId], bid: bid };
  }

  bidResults(socketId, bid) {
    const bidEntry = { user: this.socketIdToUsername[socketId], bid: bid };
    if (this.lowestBidSoFar === undefined && this.hasValidBid === false) {
      this.bids.push(bidEntry);
      this.lowestBidSoFar = this.bids[this.bids.length - 1].bid;
      this.lowestBidderSoFar = this.bids[this.bids.length - 1].user;
      this.hasValidBid = true;
      return {
        initiateTimer: true,
        lowestBidder: this.lowestBidderSoFar,
        lowestBid: this.lowestBidSoFar,
      };
    }
    if (bid < this.lowestBidSoFar && this.hasValidBid === true) {
      this.bids.push(bidEntry);
      this.lowestBidSoFar = this.bids[this.bids.length - 1].bid;
      this.lowestBidderSoFar = this.bids[this.bids.length - 1].user;
    } else if (bid >= this.lowestBidSoFar && this.hasValidBid === true) {
      if (bid >= this.bids[0].bid) {
        this.bids.unshift(bidEntry);
      } else {
        for (let i = 0; i <= this.bids.length - 2; i++) {
          if (bid < this.bids[i].bid && bid >= this.bids[i + 1].bid) {
            this.bids.splice(i + 1, 0, bidEntry);
            break;
          }
        }
      }
    }
    return {
      initiateTimer: false,
      lowestBidder: this.lowestBidderSoFar,
      lowestBid: this.lowestBidSoFar,
    };
  }
}

module.exports = Game;
