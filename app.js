const express = require('express')
var app = express();
var server = app.listen(3000);
var io = require('socket.io')(server);
const sharp = require('sharp');

var frameCount = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('myStream', (data) => {
      frameCount++;
    console.log('frames recieved ', frameCount);
    console.log(typeof(data));
    socket.emit('player',data);
    //socket.emit('player',sharp(data).rotate());
  })
});

//app.listen(3000, () => console.log('Server ready'))