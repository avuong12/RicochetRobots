const RicochetRobots = require('./rrobotsToClient');

class Game {
  constructor(
    userNames = new Set(),
    socketToUserMap = {},
    userTosocketMap = {},
    chats = []
  ) {
    this.ricochetRobots = new RicochetRobots();
    this.initialRobotsPositions = undefined;
    this.currentTarget = undefined;
    this.selectedRobotColor = undefined;
    this.hasValidBid = false;
    this.bids = [];
    this.winningBid = undefined;
    this.winnerOfAuction = undefined;
    this.claimedTargets = {};
    this.usernames = userNames;
    this.socketIdToUsername = socketToUserMap;
    this.usernameToSocketId = userTosocketMap;
    this.chats = chats;
    this.startTime = undefined;
  }

  setNewGame() {
    let newGame = new Game(
      this.usernames,
      this.socketIdToUsername,
      this.usernameToSocketId,
      this.chats
    );
    return newGame;
  }

  setInitialRobotPositions(robotPositions) {
    this.initialRobotsPositions = this.ricochetRobots.deepCopyRobots(
      robotPositions
    );
    this.ricochetRobots.setInitialRobots(robotPositions);
  }

  setCurrentTarget(targetCandidate) {
    this.currentTarget = targetCandidate;
    this.ricochetRobots.currentTarget = targetCandidate;
    this.initialRobotsPositions = this.ricochetRobots.deepCopyRobots(
      this.ricochetRobots.board.getRobots()
    );
    this.ricochetRobots.setInitialRobots(this.initialRobotsPositions);
    this.ricochetRobots.setCurrentTargetinGrid();
    this.bids = [];
    this.winnerOfAuction = undefined;
    this.hasValidBid = false;
    this.startTime = undefined;
    return true;
  }

  addUser(socketId, name) {
    // username already choosen by another player.
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
    let time = Date.now();
    const bidEntry = {
      user: this.socketIdToUsername[socketId],
      bid: bid,
      time: time,
    };
    if (this.claimedTargets[bidEntry.user] === undefined) {
      bidEntry.wonTargets = 0;
    } else {
      bidEntry.wonTargets = this.claimedTargets[bidEntry.user].length;
    }
    this.bids.push(bidEntry);
    if (this.hasValidBid === false) {
      this.hasValidBid = true;
      this.startTime = time;
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
    if (winningBidEntry === undefined) {
      return;
    }
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
    let endGame = false;
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
      // TODO: change requirement to 17 after testing.
      if (this.ricochetRobots.board.wonTargets.size === 3) {
        endGame = this.getWinner();
      }
    }
    return {
      roundWinner: name,
      wonTarget: this.currentTarget,
      endGame: endGame,
    };
  }

  removeUser(socketId) {
    const userToRemove = this.socketIdToUsername[socketId];
    this.usernames.delete(userToRemove);
    delete this.socketIdToUsername[socketId];
    delete this.usernameToSocketId[userToRemove];
    return userToRemove;
  }

  getWinner() {
    // Order the user by points.
    let scores = [];
    for (let key in this.claimedTargets) {
      let playerPoints = {};
      playerPoints.player = key;
      playerPoints.points = this.claimedTargets[key].length;
      scores.push(playerPoints);
    }
    this.sortPlayers(scores);
    const winners = this.getTopScoresPlayers(scores);
    return winners;
  }

  sortPlayers(scores) {
    let lower = 0;
    let upper = scores.length - 1;
    for (let i = lower; i < upper; i++) {
      for (let j = upper; j > lower; j--) {
        if (scores[j].points < scores[j - 1].points) {
          swap(scores, j, j - 1);
        }
      }
    }
  }

  getTopScoresPlayers(scores) {
    const highestScore = scores[scores.length - 1].points;
    let winners = [];
    while (
      scores.length > 0 &&
      scores[scores.length - 1].points === highestScore
    ) {
      let winner = scores.pop();
      winners.push(winner.player);
    }
    return winners;
  }
}

module.exports = Game;

function swap(arr, a, b) {
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
