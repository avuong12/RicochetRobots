const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const Game = require('./gameToClient');

app.use(
  session({
    // this mandatory configuration ensures that session IDs are not predictable
    secret: process.env.SESSION_SECRET || 'SocketPractice', // or whatever you like

    // this option says if you haven't changed anything, don't resave. It is recommended and reduces session concurrency issues
    resave: false,
    // this option says if I am new but not modified still save
    saveUninitialized: true,
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.use(express.static(path.join(__dirname + '/../client/')));

const port = process.env.PORT || 8000; // this can be very useful if you deploy to Heroku!

const server = app.listen(port, function () {
  console.log(`Your server, listening on port ${port}`);
});

const io = require('socket.io')(server);

app.use((req, res, next) => {
  console.log(req.session, `session id: ${req.sessionID}`);
  next(); // needed to continue through express middleware
});

let bids = [];

let targets = new Set();
let pickedTargets = [];

let hasValidBid = false;
let lowestBidSoFar = undefined;
let lowestBidderSoFar = undefined;
let winnerOfAuction = undefined;

let claimedTargets = {};

let game = new Game();

function sendHeartbeat() {
  setTimeout(sendHeartbeat, 8000);
  io.emit('ping', { beat: 1 });
}

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  io.to(socket.id).emit('set_up_game', JSON.stringify(game));

  socket.on('pong', (data) => {
    console.log('Pong received from client');
  });
  // Setting a new user.
  socket.on('set_username', (name) => {
    const newName = name.toLowerCase();
    if (!game.usernames.has(newName)) {
      game.usernames.add(newName);
      game.socketIdToUsername[socket.id] = newName;
      game.usernameToSocketId[newName] = socket.id;
      console.log(game.usernameToSocketId);
      io.emit('set_username', newName);
      io.to(socket.id).emit(
        'highlight_own_username',
        newName,
        'lightgoldenrodyellow'
      );
    } else {
      io.to(socket.id).emit('set_username', false);
    }
    // restore all targets won by all users to new user.
    io.to(socket.id).emit(
      'send_all_targets_won',
      JSON.stringify(game.claimedTargets)
    );
    // restore the targets previously won by the user rejoining.
    if (claimedTargets.hasOwnProperty(newName)) {
      const targetsPreviouslyWon = game.claimedTargets[newName];
      console.log('sending user target');
      socket.broadcast.emit(
        'send_targets_won',
        newName,
        JSON.stringify(targetsPreviouslyWon)
      );
    }
  });

  // Sending a new message.
  socket.on('send_message', (msg) => {
    const chatEntry = {
      user: game.socketIdToUsername[socket.id],
      message: msg,
    };
    game.chats.push(chatEntry);
    io.emit('send_message', `${game.socketIdToUsername[socket.id]}: ${msg}`);
  });

  // Emits all users connected to socket only to new client when requested.
  socket.on('get_usernames', () => {
    const names = Object.values(game.socketIdToUsername);
    io.to(socket.id).emit('send_usernames', JSON.stringify(names));
  });

  // Emits chat history only to new client when requested.
  socket.on('get_chat_history', () => {
    io.to(socket.id).emit('send_chat_history', JSON.stringify(game.chats));
  });

  // Submitting a bid.
  socket.on('send_bid', (bid) => {
    const numberBid = Number(bid);
    io.emit('send_bid', `${game.socketIdToUsername[socket.id]}: ${bid} steps`);
    const bidEntry = { user: game.socketIdToUsername[socket.id], bid: bid };
    // order the bids in decreasing order, relative to the lowestBidSoFar.
    if (lowestBidSoFar === undefined && hasValidBid === false) {
      bids.push(bidEntry);
      lowestBidSoFar = Number(bids[bids.length - 1].bid);
      lowestBidderSoFar = bids[bids.length - 1].user;
      io.emit('start_timer', true);
      io.emit('lowest_bid_user', lowestBidderSoFar, lowestBidSoFar);
      hasValidBid = true;
    } else if (numberBid < lowestBidSoFar && hasValidBid === true) {
      bids.push(bidEntry);
      lowestBidSoFar = Number(bids[bids.length - 1].bid);
      lowestBidderSoFar = bids[bids.length - 1].user;
      io.emit('lowest_bid_user', lowestBidderSoFar, lowestBidSoFar);
    } else if (numberBid >= lowestBidSoFar && hasValidBid === true) {
      if (bid >= Number(bids[0].bid)) {
        bids.unshift(bidEntry);
      } else {
        for (let i = 0; i <= bids.length - 2; i++) {
          if (
            numberBid < Number(bids[i].bid) &&
            numberBid >= Number(bids[i + 1].bid)
          ) {
            bids.splice(i + 1, 0, bidEntry);
            break;
          }
        }
      }
    }
  });

  //Emits selected target to all users.
  socket.on('send_selected_target', (targetCandidate) => {
    if (targets.has(targetCandidate)) {
      io.emit('get_selected_target', false);
    } else {
      pickedTargets.push(targetCandidate);
      bids = [];
      lowestBidSoFar = undefined;
      lowestBidderSoFar = undefined;
      winnerOfAuction = undefined;
      hasValidBid = false;
      io.emit(
        'get_selected_target',
        JSON.stringify(pickedTargets[pickedTargets.length - 1])
      );
    }
  });

  // Emits inital robots positions to all users.
  socket.on('send_inital_robots_positions', (initialRobotsPositions) => {
    io.emit(
      'get_initial_robots_positions',
      JSON.stringify(initialRobotsPositions)
    );
  });

  // Emits selected robot to all users.
  socket.on('send_selectedRobot', (selectedRobot) => {
    io.emit('get_selected_robot', selectedRobot);
  });

  // Emits boolean to start new game.
  socket.on('send_new_game', () => {
    // clear picked targets;
    targets = new Set();
    pickedTargets = [];
    lowestBidSoFar = undefined;
    lowestBidderSoFar = undefined;
    claimedTargets = {};
    winnerOfAuction = undefined;
    io.emit('get_new_game', true);
  });

  // Emits key direction to all users.
  socket.on('send_key_direction', (keyDirection) => {
    io.emit('get_key_direction', keyDirection);
  });

  // Emits boolean to reset positions to all users.
  socket.on('send_request_to_reset_positions', (reset) => {
    io.emit('get_reset_positions', reset);
  });

  // Emits the user that won the auction.
  socket.on('send_winner_of_auction', (lowestBidder) => {
    if (lowestBidderSoFar === lowestBidder) {
      winnerOfAuction = lowestBidder;
      io.emit('get_winner_of_auction', winnerOfAuction);
      io.to(game.usernameToSocketId[winnerOfAuction]).emit(
        'get_user_to_reveal_path',
        winnerOfAuction
      );
    }
  });

  // Emits the user that made the lowest bid if target was reached.
  socket.on('send_target_has_been_reached', (steps, target, winner) => {
    if (steps <= lowestBidSoFar && winner === winnerOfAuction) {
      console.log(claimedTargets[lowestBidderSoFar]);
      if (claimedTargets[lowestBidderSoFar] === undefined) {
        claimedTargets[lowestBidderSoFar] = [target];
      } else {
        claimedTargets[lowestBidderSoFar].push(target);
      }
      console.log(claimedTargets);
      io.emit('get_user_and_reached_target', winnerOfAuction, target);
    } else {
      return false;
    }
  });

  socket.on('disconnect', () => {
    const userToRemove = game.socketIdToUsername[socket.id];
    game.usernames.delete(userToRemove);
    delete game.socketIdToUsername[socket.id];
    delete game.usernameToSocketId[userToRemove];
    io.emit('remove_user', userToRemove);
    console.log(`${socket.id} disconnected`);
  });
});
// Keeps the socket active in order to use socket.id.
setTimeout(sendHeartbeat, 8000);
