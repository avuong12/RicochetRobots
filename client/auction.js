class Auction {
  constructor(socket) {
    this.socket = socket;
    this.currentTimer = undefined;
    this.lowestBidder = undefined;
    this.lowestBid = undefined;
  }

  makeBid(event) {
    event.preventDefault();
    let inputBid = document.getElementById('bid');
    this.socket.emit('send_bid', inputBid.value);
    inputBid.value = '';
    return false;
  }

  addBid(bid) {
    const bids = document.getElementById('auctions');
    const newBid = document.createElement('li');
    newBid.innerHTML = bid;
    bids.appendChild(newBid);
  }

  startTimer(bidStarted) {
    if (bidStarted === true) {
      // Tracks the time in which the timer is started.
      this.currentTimer = Math.floor(Date.now() / 1000);
    } else {
      this.currentTimer = undefined;
      return false;
    }
    const bidDiv = document.getElementById('bid_results');
    const timerDiv = document.createElement('div');
    bidDiv.appendChild(timerDiv);
    const updateTimer = () => {
      timerDiv.setAttribute('id', 'timer');
      if (this.currentTimer === undefined) {
        timerDiv.innerHTML = '';
        timerDiv.style.color = 'white';
        return;
      }
      // Subsequent time after the timer was pressed.
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 60 - (currentTime - this.currentTimer);
      if (secondsRemaining === 60) {
        timerDiv.innerHTML = 'Time Remaining to Place Bid: 1:00 min';
        timerDiv.style.backgroundColor = 'yellow';
        //
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 60 && secondsRemaining >= 10) {
        timerDiv.innerHTML = `Time Remaining to Place Bid: 0:${secondsRemaining} sec`;
        timerDiv.style.backgroundColor = 'yellow';
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 10 && secondsRemaining > 0) {
        timerDiv.innerHTML = `Time Remaining to Place Bid: 0:0${secondsRemaining} sec`;
        timerDiv.style.backgroundColor = 'yellow';
        window.requestAnimationFrame(updateTimer);
      } else {
        timerDiv.innerHTML = `Time is Up! Stop bidding. Reveal the Path ${this.lowestBidder.toUpperCase()}.`;
        timerDiv.style.backgroundColor = 'yellow';
        this.currentTimer = undefined;
      }
    };
    window.requestAnimationFrame(updateTimer);
  }

  getLowestBidUser(user, bid) {
    const bidDiv = document.getElementById('bid_results');
    if (this.lowestBidder === undefined) {
      const userBid = document.createElement('div');
      userBid.setAttribute('id', 'bidder');
      userBid.innerHTML = `Number of steps to beat: ${bid}. Made by ${user.toUpperCase()}.`;
      bidDiv.appendChild(userBid);
      this.lowestBidder = user;

      this.lowestBid = bid;
    } else {
      const newUserBid = document.getElementById('bidder');
      newUserBid.innerHTML = `Number of steps to beat: ${bid}. Made by ${user.toUpperCase()}.`;
      this.lowestBidder = user;

      this.lowestBid = bid;
    }
  }

  removeBids() {
    // Clear bids in auction.
    const bids = document.getElementById('auctions');
    bids.innerHTML = '';
    // remove timer.
    this.currentTimer = undefined;
    const timerDiv = document.getElementById('timer');
    if (timerDiv !== null) {
      timerDiv.remove();
    }
    // remove prompt for user with lowest bid for previous target.
    const bidDiv = document.getElementById('bidder');
    if (bidDiv !== null) {
      bidDiv.remove();
    }
    this.lowestBidder = undefined;
    this.lowestBid = undefined;
  }

  setupAuctionSocketHandlers() {
    this.socket.on('send_bid', (bid) => {
      this.addBid(bid);
    });
    this.socket.on('start_timer', (bidStarted) => {
      this.startTimer(bidStarted);
    });
    this.socket.on('lowest_bid_user', (user, bid) => {
      this.getLowestBidUser(user, bid);
    });
    this.socket.on('get_selected_target', () => {
      this.removeBids();
    });
  }
}
let auction = undefined;

function loadAuctionApp() {
  auction = new Auction(socket);
  const bid = document.getElementById('bid-form');
  bid.onsubmit = (event) => {
    return auction.makeBid(event);
  };
  auction.setupAuctionSocketHandlers();
}
