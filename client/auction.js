class Auction {
  constructor(socket) {
    this.socket = socket;
    this.currentTimer = undefined;
    this.winningBidder = undefined;
    this.winningBid = undefined;
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
    const startTimerDiv = document.createElement('div');
    startTimerDiv.innerText = 'TIMER STARTED!';
    bidDiv.appendChild(startTimerDiv);
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
        startTimerDiv.innerHTML = 'Time is Up! Stop bidding.';
        this.getWinnerOfAuction();
        bidDiv.removeChild(timerDiv);
        this.currentTimer = undefined;
      }
    };
    window.requestAnimationFrame(updateTimer);
  }

  announceWinner(name, steps) {
    const auctionDiv = document.getElementById('bid_results');
    const auctionWinnerDiv = document.createElement('div');
    auctionWinnerDiv.innerText = `Auction Winner: ${name.toUpperCase()}. Reveal Path in ${steps} Steps.`;
    auctionDiv.appendChild(auctionWinnerDiv);
  }

  getWinnerOfAuction() {
    this.socket.emit('get_winner_of_auction');
  }

  removeBids() {
    // Clear bids in auction.
    const bids = document.getElementById('auctions');
    bids.innerHTML = '';
    // remove timer.
    this.currentTimer = undefined;
    const bidResults = document.getElementById('bid_results');
    while (bidResults.firstChild) {
      bidResults.removeChild(bidResults.firstChild);
    }
    this.winningBidder = undefined;
    this.winningBid = undefined;
    this.firstBidder = false;
  }

  setupAuctionSocketHandlers() {
    this.socket.on('send_bid', (bid) => {
      this.addBid(bid);
    });
    this.socket.on('start_timer', (bidStarted) => {
      this.startTimer(bidStarted);
    });
    this.socket.on('send_winner_of_auction', (user, bid) => {
      this.announceWinner(user, bid);
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
