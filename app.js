const express = require('express')
var app = express();
var server = app.listen(3000);
var io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('stream', (data) => {
    console.log('message: ' + data);
    socket.broadcast.emit('player',data);
  })
});

//app.listen(3000, () => console.log('Server ready'))