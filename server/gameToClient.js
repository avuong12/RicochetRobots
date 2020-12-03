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

  verifyTargetWinner(steps, target, name) {
    if (steps > this.lowestBidSoFar || name !== this.winnerOfAuction) {
      // assign winnerOfAuction to next bidder in bids.
      // TODO: return next bidder.
      return false;
    }
    if (steps <= this.lowestBidSoFar && name === this.winnerOfAuction) {
      if (this.claimedTargets[name] === undefined) {
        this.claimedTargets[name] = [target];
      } else {
        this.claimedTargets[name].push(target);
      }
    }
    return this.winnerOfAuction;
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
          let numberOfOppTargets = 0;
          if (this.claimedTargets[bids[k]] !== undefined) {
            numberOfOppTargets = this.claimedTargets[bids[k].user].length;
          }
          if (numberOfOppTargets > numberOfTargets) {
            bids.push(0);
            moveDown(bids, k);
            bids[k + 1] = input;
            break;
          } else if (number) k--;
          if (bids[k] === undefined) {
            break;
          }
        }
      }
    }
    return bids;
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
