const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();

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

let userNames = new Set();
let socketIdToUsername = {};

let chats = [];

let bids = [];

let targets = new Set();
let pickedTargets = [];

let hasValidBid = false;
let lowestBidSoFar = undefined;

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
    if (!userNames.has(name)) {
      userNames.add(name);
      socketIdToUsername[socket.id] = name;
      io.emit('set_username', name);
    } else {
      io.to(socket.id).emit('set_username', false);
    }
  });

  // Sending a new message.
  socket.on('send_message', (msg) => {
    const chatEntry = { user: socketIdToUsername[socket.id], message: msg };
    chats.push(chatEntry);
    io.emit('send_message', `${socketIdToUsername[socket.id]}: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });

  // Emits all users connected to socket only to new client when requested.
  socket.on('get_usernames', () => {
    const names = Object.values(socketIdToUsername);
    io.to(socket.id).emit('send_usernames', JSON.stringify(names));
  });

  // Emits chat history only to new client when requested.
  socket.on('get_chat_history', () => {
    io.to(socket.id).emit('send_chat_history', JSON.stringify(chats));
  });

  // Submitting a bid.
  socket.on('send_bid', (bid) => {
    io.emit('send_bid', `${socketIdToUsername[socket.id]}: ${bid} steps`);
    const bidEntry = { user: socketIdToUsername[socket.id], bid: bid };
    if (bids.length === 0 && hasValidBid === false) {
      bids.push(bidEntry);
      lowestBidSoFar = Number(bid);
      io.emit('start_timer', true);
      io.emit('lowest_bid_user', bidEntry.user, bidEntry.bid);
      hasValidBid = true;
    } else if (hasValidBid === true && Number(bid) < lowestBidSoFar) {
      bids.push(bidEntry);
      io.emit('lowest_bid_user', bidEntry.user, bidEntry.bid);
      lowestBidSoFar = Number(bid);
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

  // Emits the user that made the lowest bid if target was reached.
  socket.on('send_target_has_been_reached', (reached) => {
    if (reached) {
      const user = socketIdToUsername[socket.id];
      console.log(user);
      io.emit('get_user_that_reached_target', user);
    }
  });
});
// Keeps the socket active in order to use socket.id.
setTimeout(sendHeartbeat, 8000);
