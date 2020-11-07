class Chat {
  constructor(socket) {
    this.socket = socket;
  }

  restoreUserNames(names) {
    let allNames = JSON.parse(names);
    for (let i = 0; i < allNames.length; i++) {
      const usernames = document.getElementById('users');
      const newUsername = document.createElement('li');
      newUsername.innerHTML = allNames[i].toUpperCase();
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
    newUsername.innerHTML = name.toUpperCase();
    const scores = document.createElement('div');
    scores.setAttribute('class', 'scores');
    scores.id = `${name}'s targets`;
    newUsername.appendChild(scores);
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

    scrollToBottom(messages);
  }

  awardTargetToUser(user, target) {
    const targetColor = target.color;
    const targetShape = target.shape;
    const targetDiv = document.getElementById(`${user}'s targets`);
    const targetSpan = document.createElement('span');
    targetSpan.setAttribute('class', 'won-target');
    if (targetColor === RED_TARGET) {
      targetSpan.classList.add('red-target');
    } else if (targetColor === GREEN_TARGET) {
      targetSpan.classList.add('green-target');
    } else if (targetColor === BLUE_TARGET) {
      targetSpan.classList.add('blue-target');
    } else if (targetColor === YELLOW_TARGET) {
      targetSpan.classList.add('yellow-target');
    } else if (targetColor === WILD_TARGET) {
      targetSpan.classList.add('wild-target');
    }

    if (targetShape === SQUARE_TARGET) {
      targetSpan.classList.add('square-target');
    } else if (targetShape === CRICLE_TARGET) {
      targetSpan.classList.add('circle-target');
    } else if (targetShape === TRIANGLE_TARGET) {
      targetSpan.classList.add('triangle-target');
    } else if (targetShape === HEXAGON_TARGET) {
      targetSpan.classList.add('hexagon-target');
    } else if (targetShape === VORTEX_TARGET) {
      targetSpan.classList.add('vortex-target');
    }
    targetDiv.appendChild(targetSpan);
  }

  setupSocketHandlers() {
    this.socket.on('send_message', (message) => {
      this.addMessage(message);
    });
    this.socket.on('set_username', (username) => {
      this.addUserName(username);
    });
    this.socket.on('send_usernames', (usernames) => {
      this.restoreUserNames(usernames);
    });
    this.socket.on('send_chat_history', (chats) => {
      this.restoreMessagesHistory(chats);
    });
    this.socket.on('ping', (data) => {
      this.socket.emit('pong', data);
    });
    // Recieves the user that reached the target from server.
    this.socket.on('get_user_and_reached_target', (userData, targetData) => {
      this.awardTargetToUser(userData, targetData);
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

function scrollToBottom(elem) {
  elem.scrollTop = elem.scrollHeight;
}
