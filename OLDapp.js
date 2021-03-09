const express = require('express')
var app = express();
var server = app.listen(3000);
var io = require('socket.io')(server);


const { createCanvas, loadImage, Image } = require('canvas')
const canvas = createCanvas(320, 240)
const ctx = canvas.getContext('2d')

const tf = require('@tensorflow/tfjs-node');
//require('@tensorflow/tfjs-core');
require('@tensorflow/tfjs-backend-webgl');
require('@tensorflow/tfjs-backend-cpu');
        //const tfjsWasm = require('@tensorflow/tfjs-backend-wasm');
const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
        //const wgl = require('@tensorflow/tfjs-backend-webgl');

// var gl = require('gl')(10, 10)
// assert(gl.drawingBufferHeight === 10 && gl.drawingBufferWidth === 10)

const model = faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {maxFaces: 1});


const state = {
  backend: 'node',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: true
};

tf.setBackend(state.backend);

ctx.width = canvas.width;
ctx.height = canvas.height;

var frameCount = 0;

async function run() {

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

            console.log('Using TensorFlow backend: ', tf.getBackend());
            //console.log(webgl);
            if(model) {
                const predictions = await model.estimateFaces({
                    input: image,
                    returnTensors: false,
                    flipHorizontal: false,
                    predictIrises: state.predictIrises
                });

                if (predictions.length > 0) {
                    predictions.forEach(prediction => {
                    const keypoints = prediction.scaledMesh;

                    if (state.triangulateMesh) {
                        ctx.strokeStyle = GREEN;
                        ctx.lineWidth = 0.5;

                        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
                        const points = [
                            TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
                            TRIANGULATION[i * 3 + 2]
                        ].map(index => keypoints[index]);

                        drawPath(ctx, points, true);
                        }
                    } else {
                        ctx.fillStyle = GREEN;

                        for (let i = 0; i < NUM_KEYPOINTS; i++) {
                        const x = keypoints[i][0];
                        const y = keypoints[i][1];

                        ctx.beginPath();
                        ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                        ctx.fill();
                        }
                    }

                    if(keypoints.length > NUM_KEYPOINTS) {
                        ctx.strokeStyle = RED;
                        ctx.lineWidth = 1;

                        const leftCenter = keypoints[NUM_KEYPOINTS];
                        const leftDiameterY = distance(
                        keypoints[NUM_KEYPOINTS + 4],
                        keypoints[NUM_KEYPOINTS + 2]);
                        const leftDiameterX = distance(
                        keypoints[NUM_KEYPOINTS + 3],
                        keypoints[NUM_KEYPOINTS + 1]);

                        ctx.beginPath();
                        ctx.ellipse(leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2, 0, 0, 2 * Math.PI);
                        ctx.stroke();

                        if(keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
                        const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
                        const rightDiameterY = distance(
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
                        const rightDiameterX = distance(
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

                        ctx.beginPath();
                        ctx.ellipse(rightCenter[0], rightCenter[1], rightDiameterX / 2, rightDiameterY / 2, 0, 0, 2 * Math.PI);
                        ctx.stroke();
                        }
                    }
                    });
                }
            }
            

            //ctx.drawImage(image, 0, 0, ctx.width, ctx.height);
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
}
run();

//app.listen(3000, () => console.log('Server ready'))