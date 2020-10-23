class Auction {
  constructor(socket) {
    this.socket = socket;
    this.currentTimer = undefined;
    this.lowestBidder = undefined;
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

    const updateTimer = () => {
      let timerDiv = document.getElementById('timer');
      if (this.currentTimer === undefined) {
        timerDiv.innerHTML = '';
        return;
      }
      // Subsequent time after the timer was pressed.
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 60 - (currentTime - this.currentTimer);
      if (secondsRemaining === 60) {
        timerDiv.innerHTML = '1:00 min';
        //
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 60 && secondsRemaining >= 10) {
        timerDiv.innerHTML = `0:${secondsRemaining} sec`;
        window.requestAnimationFrame(updateTimer);
      } else if (secondsRemaining < 10 && secondsRemaining > 0) {
        timerDiv.innerHTML = `0:0${secondsRemaining} sec`;
        window.requestAnimationFrame(updateTimer);
      } else {
        timerDiv.innerHTML = `Time is Up! Stop bidding. Reveal the Path ${this.lowestBidder.toUpperCase()}.`;
        this.currentTimer = undefined;
      }
    };
    window.requestAnimationFrame(updateTimer);
  }

  getLowestBidUser(user, bid) {
    const userBid = document.getElementById('bidder');
    userBid.innerHTML = `Number of steps to beat: ${bid}. Made by ${user.toUpperCase()}.`;
    this.lowestBidder = user;
  }

  setupAuctionSocketHandlers() {
    this.socket.on('send_bid', this.addBid);
    this.socket.on('start_timer', this.startTimer);
    this.socket.on('lowest_bid_user', this.getLowestBidUser);
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
