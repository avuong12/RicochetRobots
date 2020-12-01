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
    if (this.hasValidBid === true) {
      this.bids = this.insertionSort(this.bids, bidEntry);
    }
    return {
      initiateTimer: false,
      lowestBidder: this.bids[this.bids.length - 1].user,
      lowestBid: this.bids[this.bids.length - 1].bid,
    };
  }

  removeUser(socketId) {
    const userToRemove = this.socketIdToUsername[socketId];
    this.usernames.delete(userToRemove);
    delete this.socketIdToUsername[socketId];
    delete this.usernameToSocketId[userToRemove];
    return userToRemove;
  }

  insertionSort(bids, input) {
    // Place the bid in order with claimedTargets inconsideration.
    let numberOfTargets = 0;
    if (this.claimedTargets[input.user] !== undefined) {
      numberOfTargets = this.claimedTargets[input.user].length;
    }
    for (let i = bids.length - 1; i >= 0; i--) {
      if (input.bid < bids[i].bid) {
        bids.push(0);
        // input gets placed ahead of nums[i] and all nums move back by one.
        moveDown(bids, i);
        bids[i + 1] = input;
        break;
      }
      if (i === 0) {
        bids.push(0);
        moveDown(bids, i);
        bids[i] = input;
      }
      if (input.bid === bids[i].bid) {
        let k = i;
        while (input.bid === bids[k].bid) {
          const numberOfOppTargets = this.claimedTargets[bids[k].user].length;
          if (numberOfOppTargets > numberOfTargets) {
            bids.push(0);
            moveDown(bids, k);
            bids[k + 1] = input;
            break;
          }
          k--;
        }
      }
    }
    return bids;
  }
}

module.exports = Game;

function moveDown(bids, pointer) {
  for (let j = bids.length - 2; j >= pointer; j--) {
    let last = bids[j];
    bids[j + 1] = last;
  }
}
