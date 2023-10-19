const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

const connectedUsers = new Map();

io.on('connection', (socket) => {
    let userName = '';

    socket.on('join', (user) => {
        userName = user.name;
        connectedUsers.set(userName, user.color);
        if (connectedUsers.size === 1) {
            socket.emit('welcome', 'Добро пожаловать. Вы первый в чате.');
        } else {
            const welcomeMessage = `Добро пожаловать. В чате уже присутствуют: ${[...connectedUsers.keys()].join(', ')}.`;
            socket.emit('welcome', welcomeMessage);
            socket.broadcast.emit('userJoin', { name: userName, color: user.color });
        }
    });

    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(userName);
        socket.broadcast.emit('userLeft', userName);
    });


    socket.on('privateMessage', (data) => {
        const recipientSocket = [...io.sockets.sockets.values()].find(
            (socket) => socket.handshake.query.name === data.recipient
        );

        if (recipientSocket) {
            recipientSocket.emit('message', {
                name: `Лично от ${data.sender}`,
                message: data.message,
                color: connectedUsers.get(data.sender),
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
