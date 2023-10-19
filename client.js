document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messageList = document.getElementById('messageList');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const colorInput = document.getElementById('color'); // Поле для выбора цвета
    const userList = document.getElementById('userList'); // Список пользователей
    let userName = ''; // Имя пользователя
    let userColor = ''; // Цвет пользователя
    let connectedUsers = new Set(); // Список пользователей

    sendButton.addEventListener('click', () => {
        const name = nameInput.value;
        const message = messageInput.value;
        const color = colorInput.value; // Получаем выбранный пользователем цвет

        if (name && message) {
            if (!userName) {
                userName = name;
                userColor = color; // Используем выбранный цвет
                socket.emit('join', { name: userName, color: userColor });
            }
            socket.emit('message', { name: userName, message, color: userColor });
            messageInput.value = '';
        }
    });

    socket.on('message', (data) => {
        const item = document.createElement('li');
        const messageText = document.createElement('span');
        messageText.style.color = data.color;
        messageText.textContent = `${data.name}: ${data.message}`;
        item.appendChild(messageText);
        messageList.appendChild(item);
    });

    socket.on('welcome', (message) => {
        const item = document.createElement('li');
        item.textContent = message;
        messageList.appendChild(item);
    });

    socket.on('userJoin', (user) => {
        const item = document.createElement('li');
        item.textContent = `${user.name} присоединился к чату.`;
        messageList.appendChild(item);
        connectedUsers.add(user.name);
        updateUserList(connectedUsers);
    });

    socket.on('userLeft', (userName) => {
        const item = document.createElement('li');
        item.textContent = `${userName} покинул чат.`;
        messageList.appendChild(item);
        connectedUsers.delete(userName);
        updateUserList(connectedUsers);
    });

    function updateUserList(users) {
        userList.innerHTML = ''; // Очистка списка пользователей
        users.forEach((user) => {
            const item = document.createElement('li');
            item.textContent = user;
            userList.appendChild(item);
        });
    }

    // Добавьте обработчик отправки по нажатию клавиши Enter
    messageInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    // Добавьте обработчик выбора цвета
    colorInput.addEventListener('input', (event) => {
        userColor = event.target.value; // Обновляем цвет пользователя при выборе
    });

    // Обработка отправки личных сообщений
    userList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'LI') {
            const recipient = target.textContent;
            const message = prompt(`Введите сообщение для ${recipient}`);
            if (message) {
                socket.emit('privateMessage', { sender: userName, recipient, message });
            }
        }
    });
});
