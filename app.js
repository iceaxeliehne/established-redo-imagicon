const express = require('express')
var app = express();
var server = app.listen(3000);
var io = require('socket.io')(server);
//var tracking = require('tracking');

const { createCanvas, loadImage, Image } = require('canvas')
const canvas = createCanvas(320, 240)
const ctx = canvas.getContext('2d')

ctx.width = canvas.width;
ctx.height = canvas.height;

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
        //console.log(typeof(data));
        var image = new Image();
        image.src = data;
        ctx.drawImage(image, 0, 0, ctx.width, ctx.height);
        // Write "Awesome!"
        ctx.font = '30px Impact'
        //ctx.rotate(0.1)
        ctx.fillText('Awesome!', 50, 100)
        // Draw line under text
        var text = ctx.measureText('Awesome!')
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.lineTo(50, 102)
        ctx.lineTo(50 + text.width, 102)
        ctx.stroke()

        //socket.emit('player',data);
        socket.emit('player', canvas.toDataURL('image/webp'));
    })
});

//app.listen(3000, () => console.log('Server ready'))