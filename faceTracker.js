const tf = require('@tensorflow/tfjs');
const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');

let model, predictions;

const state = {
  backend: 'node',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: true
};

async function loadMyModel() {
    model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {maxFaces: 1});
    return model;
}

async function predictFromMyModel(image) {
    predictions = await model.estimateFaces({
                    input: image,
                    returnTensors: false,
                    flipHorizontal: false,
                    predictIrises: state.predictIrises
                });
    return predictions;
}

module.exports = {
  model,
  predictions,
  loadMyModel,
  predictFromMyModel
}