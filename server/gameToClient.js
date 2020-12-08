const RicochetRobots = require('./rrobotsToClient');

class Game {
  constructor() {
    this.ricochetRobots = new RicochetRobots();
    this.robots = undefined;
    this.currentTarget = undefined;
    // May not need targets or pickedTargets.
    this.targets = new Set();
    this.pickedTargets = [];
    this.selectedRobotColor = undefined;
    this.hasValidBid = false;
    this.bids = [];
    this.winningBid = undefined;
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
    this.winningBid = undefined;
    this.winnerOfAuction = undefined;
    this.wonTargets = new Set();
    this.claimedTargets = {};
  }

  setInitialRobotPositions(robotPositions) {
    this.robots = robotPositions;
  }

  setCurrentTarget(targetCandidate) {
    this.pickedTargets.push(targetCandidate);
    this.currentTarget = targetCandidate;
    this.ricochetRobots.currentTarget = targetCandidate;
    this.ricochetRobots.setCurrentTargetinGrid();
    this.bids = [];
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

  logBids(socketId, bid) {
    const bidEntry = {
      user: this.socketIdToUsername[socketId],
      bid: bid,
      time: Date.now(),
    };
    if (this.claimedTargets[bidEntry.user] === undefined) {
      bidEntry.wonTargets = 0;
    } else {
      bidEntry.wonTargets = this.claimedTargets[bidEntry.user].length;
    }
    this.bids.push(bidEntry);
    if (this.hasValidBid === false) {
      this.hasValidBid = true;
      return true;
    }
    if (this.hasValidBid === true) {
      return false;
    }
  }

  sortBids() {
    const bids = this.bids;
    let lower = 0;
    let upper = bids.length - 1;
    for (let i = lower; i < upper; i++) {
      for (let j = upper; j > lower; j--) {
        if (bids[j].bid > bids[j - 1].bid) {
          swap(bids, j, j - 1);
        } else if (bids[j].bid === bids[j - 1].bid) {
          if (bids[j].wonTargets > bids[j - 1].wonTargets) {
            swap(bids, j, j - 1);
          } else if (bids[j].wonTargets === bids[j - 1].wonTargets) {
            if (bids[j].time > bids[j - 1].time) {
              swap(bids, j, j - 1);
            }
          }
        }
      }
    }
  }

  getAuctionWinner() {
    const winningBidEntry = this.bids[this.bids.length - 1];
    this.winnerOfAuction = winningBidEntry.user;
    this.winningBid = winningBidEntry.bid;
    return { winner: this.winnerOfAuction, bid: this.winningBid };
  }

  getNextLowestBidder() {
    this.bids.pop();
    const nextEntry = this.bids[this.bids.length - 1];
    this.winnerOfAuction = nextEntry.user;
    this.winningBid = nextEntry.bid;
    return { winner: this.winnerOfAuction, bid: this.winningBid };
  }

  setSelectedRobot(robotColor) {
    this.selectedRobotColor = robotColor;
    this.ricochetRobots.selectedRobotColor = robotColor;
    return this.selectedRobotColor;
  }

  verifyTargetWinner() {
    const steps = this.ricochetRobots.steps;
    const name = this.winnerOfAuction;
    this.ricochetRobots.steps = 0;
    const target = this.currentTarget;
    if (steps > this.winningBid) {
      // assign winnerOfAuction to next bidder in bids.
      return false;
    }
    if (steps <= this.winningBid) {
      if (this.claimedTargets[name] === undefined) {
        this.claimedTargets[name] = [target];
      } else {
        this.claimedTargets[name].push(target);
      }
      this.ricochetRobots.storeTargets(target);
    }
    return { roundWinner: name, wonTarget: this.currentTarget };
  }

  removeUser(socketId) {
    const userToRemove = this.socketIdToUsername[socketId];
    this.usernames.delete(userToRemove);
    delete this.socketIdToUsername[socketId];
    delete this.usernameToSocketId[userToRemove];
    return userToRemove;
  }
}

module.exports = Game;

function swap(arr, a, b) {
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
