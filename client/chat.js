const socket = io();

// sends the message input into form.
function sendMessage(event) {
  event.preventDefault();
  let inputMessage = document.getElementById('input-message');
  // send the message to the sever. Give it a "route".
  socket.emit('chat message', inputMessage.value);
  // clear the text block on the DOM.
  inputMessage.value = '';
  return false;
}

// adds message to the DOM.
function addMessage(message) {
  const messages = document.getElementById('messages');
  const newMessageItem = document.createElement('li');
  newMessageItem.innerHTML = message;
  messages.appendChild(newMessageItem);
}

// shows previous messages to the DOM for a new socket.
function restoreMessageHistory(chatHistory) {
  let chats = JSON.parse(chatHistory);
  for (let i = 0; i < chats.length; i++) {
    addMessage(chats[i]);
  }
}

function loadChat() {
  const form = document.getElementById('form-message');
  form.onsubmit = sendMessage;

  // receive the message from the server.
  socket.on('chat message', addMessage);
  // receive the all logged messages from the server.
  socket.on('chat history', restoreMessageHistory);
}
