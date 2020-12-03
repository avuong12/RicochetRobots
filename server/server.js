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

let targets = new Set();
let pickedTargets = [];

let game = new Game();

function sendHeartbeat() {
  setTimeout(sendHeartbeat, 8000);
  io.emit('ping', { beat: 1 });
}

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('pong', (data) => {
    console.log('Pong received from client');
  });
  // Setting a new user.
  socket.on('set_username', (name) => {
    const newName = name.toLowerCase();
    if (game.addUser(socket.id, newName) !== false) {
      io.emit('set_username', newName);
      io.to(socket.id).emit(
        'highlight_own_username',
        newName,
        'lightgoldenrodyellow'
      );
      console.log('users:', game.socketIdToUsername);
      io.to(socket.id).emit('set_up_game', JSON.stringify(game));
    } else {
      io.to(socket.id).emit('set_username', false);
    }
    // restore all targets won by all users to new user.
    io.to(socket.id).emit(
      'send_all_targets_won',
      JSON.stringify(game.claimedTargets)
    );
    // restore the targets previously won by the user rejoining.
    if (game.claimedTargets.hasOwnProperty(newName)) {
      const targetsPreviouslyWon = game.claimedTargets[newName];
      console.log('sending user target');
      socket.broadcast.emit(
        'send_targets_won',
        newName,
        JSON.stringify(targetsPreviouslyWon)
      );
    }
  });

  // Emits all users connected to socket only to new client when requested.
  socket.on('get_usernames', () => {
    const names = Object.values(game.socketIdToUsername);
    io.to(socket.id).emit('send_usernames', JSON.stringify(names));
  });

  // Emits inital robots positions to all users.
  socket.on('send_inital_robots_positions', (initialRobotsPositions) => {
    game.setInitialRobotPositions(initialRobotsPositions);
    io.emit('get_initial_robots_positions', JSON.stringify(game));
  });

  //Emits selected target to all users.
  socket.on('send_selected_target', (targetCandidate) => {
    if (!game.setCurrentTarget(targetCandidate)) {
      io.emit('get_selected_target', false);
      return false;
    }
    io.emit('get_selected_target', JSON.stringify(game));
  });

  // Submitting a bid.
  socket.on('send_bid', (bid) => {
    const numberBid = Number(bid);
    const submission = game.submitBid(socket.id, numberBid);
    io.emit('send_bid', `${submission.user}: ${submission.bid} steps`);
    if (game.logBids(socket.id, numberBid)) {
      io.emit('start_timer', true);
    } else {
      return;
    }
  });

  // Emits the user that won the auction.
  socket.on('get_winner_of_auction', () => {
    game.sortBids();
    const winningAuction = game.getAuctionWinner();
    const auctionWinner = winningAuction.winner;
    const auctionBid = winningAuction.bid;
    io.to(socket.id).emit('send_winner_of_auction', auctionWinner, auctionBid);
    io.to(game.usernameToSocketId[auctionWinner]).emit(
      'get_user_to_reveal_path',
      auctionWinner
    );
  });

  // Emits selected robot to all users.
  socket.on('send_selectedRobot', (robot) => {
    const selectedRobot = game.setSelectedRobot(robot);
    io.emit('get_selected_robot', selectedRobot);
  });

  // Emits boolean to start new game.
  socket.on('send_new_game', (set) => {
    if (!set) {
      return;
    }
    game.setNewGame();
    io.emit('get_new_game', JSON.stringify(game));
  });

  // Emits key direction to all users.
  socket.on('send_key_direction', (keyDirection) => {
    io.emit('get_key_direction', keyDirection);
  });

  // Emits boolean to reset positions to all users.
  socket.on('send_request_to_reset_positions', (reset) => {
    io.emit('get_reset_positions', reset);
  });

  // Emits the user that made the lowest bid if target was reached.
  socket.on('send_target_has_been_reached', (steps, target, winner) => {
    const roundWinner = game.verifyTargetWinner(steps, target, winner);
    io.emit('get_user_and_reached_target', roundWinner, target);
  });

  // Emits chat history only to new client when requested.
  socket.on('get_chat_history', () => {
    io.to(socket.id).emit('send_chat_history', JSON.stringify(game.chats));
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

  socket.on('disconnect', () => {
    const userToRemove = game.removeUser(socket.id);
    io.emit('remove_user', userToRemove);
    console.log(`${socket.id} disconnected`);
  });
});
// Keeps the socket active in order to use socket.id.
setTimeout(sendHeartbeat, 8000);
