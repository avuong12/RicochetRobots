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
    console.log(`${socket.id} wants to set a username`);
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
      // TODO: incoming user should also see timer and results if joining in during an auction.'
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
      socket.broadcast.emit(
        'send_targets_won',
        newName,
        JSON.stringify(targetsPreviouslyWon)
      );
    }
  });

  // Emits all users connected to socket only to new client when requested.
  socket.on('get_usernames', () => {
    console.log(`${socket.id} asks for usernames`);
    const names = Object.values(game.socketIdToUsername);
    io.to(socket.id).emit('send_usernames', JSON.stringify(names));
  });

  // Server initialized robot positions and place robots on the board. Emits inital robots positions to all users.
  socket.on('get_inital_robots_positions', () => {
    console.log(`${socket.id} asks for inital robot positions`);
    const initialRobotsPositions = game.ricochetRobots.board.initializedRobotPositionsCandidate();
    game.ricochetRobots.board.initializedRobotPositions(initialRobotsPositions);
    game.setInitialRobotPositions(initialRobotsPositions);
    io.emit('send_initial_robots_positions', JSON.stringify(game));
  });

  // Server selects the target and sets target. Emits selected target to all users.
  socket.on('get_selected_target', () => {
    console.log(`${socket.id} asks for a target`);
    const targetCandidate = game.ricochetRobots.selectNewTarget();
    if (!targetCandidate) {
      return false;
    }
    game.setCurrentTarget(targetCandidate);
    io.emit('send_selected_target', JSON.stringify(game));
  });

  // Submitting a bid.
  socket.on('send_bid', (bid) => {
    console.log(`${socket.id} submits a bid`);
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
    console.log(`${socket.id} wants to know the winner of auction`);
    game.sortBids();
    const winningAuction = game.getAuctionWinner();
    if (winningAuction === undefined) {
      return;
    }
    const auctionWinner = winningAuction.winner;
    const auctionBid = winningAuction.bid;
    io.to(socket.id).emit('send_winner_of_auction', auctionWinner, auctionBid);
    io.to(game.usernameToSocketId[auctionWinner]).emit(
      'get_user_to_reveal_path',
      auctionWinner
    );
  });

  // Server recieves the selected robot from the client. Emits selected robot to all users.
  socket.on('send_selectedRobot', (robot) => {
    console.log(`${socket.id} sends the robot they selected`);
    const selectedRobot = game.setSelectedRobot(robot);
    io.emit('get_selected_robot', selectedRobot);
  });

  // Emits boolean to start new game.
  socket.on('get_new_game', (set) => {
    if (!set) {
      return;
    }
    console.log(`${socket.id} wants to start a new game.`);
    game = game.setNewGame();
    io.emit('set_new_game', JSON.stringify(game));
  });

  // Emits key direction to all users.
  socket.on('send_key_direction', (keyDirection) => {
    const key = game.ricochetRobots.keyboardHandler(keyDirection);
    if (!key) {
      return;
    }
    io.emit('get_key_direction', key.direction);
    if (key.targetReached) {
      const winner = game.verifyTargetWinner();
      if (!winner) {
        const nextAuctionWinner = game.getNextLowestBidder();
        const nextWinner = nextAuctionWinner.winner;
        const nextBid = nextAuctionWinner.bid;
        const reset = game.ricochetRobots.resetPositions();
        if (reset) {
          io.emit('get_reset_positions', true);
        }
        io.emit('disable_moving', true);
        io.emit('send_winner_of_auction', nextWinner, nextBid);
        io.to(game.usernameToSocketId[nextWinner]).emit(
          'get_user_to_reveal_path',
          nextWinner
        );
      } else {
        io.emit(
          'get_user_and_reached_target',
          winner.roundWinner,
          winner.wonTarget
        );
        if (winner.endGame) {
          // Declare winner(s).
          io.emit('send_winners', JSON.stringify(winner.endGame));
        }
      }
    }
  });

  // Emits boolean to reset positions to all users.
  socket.on('send_request_to_reset_positions', (reset) => {
    // Reset the step.
    game.ricochetRobots.resetPositions();
    io.emit('get_reset_positions', reset);
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
