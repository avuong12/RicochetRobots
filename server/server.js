const path = require('path');
const express = require('express');
const app = express();

const port = process.env.PORT || 8000; // this can be very useful if you deploy to Heroku!
const server = app.listen(port, function () {
  console.log('Knock, knock');
  console.log("Who's there?");
  console.log(`Your server, listening on port ${port}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// serves static files.
app.use(express.static(path.join(__dirname, '../client')));

const io = require('socket.io')(server);

let chats = [];

io.on('connection', (socket) => {
  // when socket receives message from the client.
  socket.on('chat message', (msg) => {
    // push incoming messages to chat.
    chats.push(msg);
    // emit message to all web servers that are connected to the socket.
    io.emit('chat message', msg);
  });
  // emit messages to new web server connected to socket.
  io.to.emit('chat history', JSON.stringify(chats));
});

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});
