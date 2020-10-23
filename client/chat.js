class Chat {
  constructor(socket) {
    this.socket = socket;
  }

  restoreUserNames(names) {
    let allNames = JSON.parse(names);
    for (let i = 0; i < allNames.length; i++) {
      const usernames = document.getElementById('users');
      const newUsername = document.createElement('li');
      newUsername.innerHTML = allNames[i];
      usernames.appendChild(newUsername);
    }
  }

  chooseUsername(event) {
    event.preventDefault();
    let inputUsername = document.getElementById('name');
    this.socket.emit('set_username', inputUsername.value);
    inputUsername.value = '';
    return false;
  }

  addUserName(name) {
    if (name === false) {
      window.alert('Username already taken. Try again!');
      return false;
    }
    const usernames = document.getElementById('users');
    const newUsername = document.createElement('li');
    newUsername.innerHTML = name;
    usernames.appendChild(newUsername);
  }

  restoreMessagesHistory(chats) {
    const chatHistory = JSON.parse(chats);
    for (let i = 0; i < chatHistory.length; i++) {
      const messages = document.getElementById('messages');
      const newMessage = document.createElement('li');
      newMessage.innerHTML = `${chatHistory[i].user}: ${chatHistory[i].message}`;
      messages.appendChild(newMessage);
    }
  }

  sendMessage(event) {
    event.preventDefault();
    let inputMessage = document.getElementById('m');
    // send the message to the sever. Give it a "route".
    this.socket.emit('send_message', inputMessage.value);
    // clear the text block on the DOM.
    inputMessage.value = '';
    return false;
  }

  addMessage(message) {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('li');
    newMessage.innerHTML = message;
    messages.appendChild(newMessage);
  }

  setupSocketHandlers() {
    this.socket.on('send_message', this.addMessage);
    this.socket.on('set_username', this.addUserName);
    this.socket.on('send_usernames', this.restoreUserNames);
    this.socket.on('send_chat_history', this.restoreMessagesHistory);
    this.socket.on('ping', (data) => {
      console.log('client ping');
      this.socket.emit('pong', data);
      console.log('client ponged');
    });
  }
  requestChatHistory() {
    this.socket.emit('get_chat_history');
  }

  requestUserNames() {
    this.socket.emit('get_usernames');
  }
}

let chatApp = undefined;

function loadChatApp() {
  chatApp = new Chat(socket);

  // manually set this to an instance of chatApp.
  const username = document.getElementById('username');
  username.onsubmit = (event) => {
    return chatApp.chooseUsername(event);
  };

  const message = document.getElementById('message-form');
  message.onsubmit = (event) => {
    return chatApp.sendMessage(event);
  };

  chatApp.setupSocketHandlers();
  chatApp.requestUserNames();
  chatApp.requestChatHistory();
}
