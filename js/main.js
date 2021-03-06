// Creating a variable for the video source
const video = document.getElementById("video");

// Empty array for predicted ages
let predictedAges = [];

// All the promises for multiple methods avaiable from the API
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

// Function to start the video input
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

// Event listened for when the video source is playing which then runs all our methods and handles all the canvas drawing.
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    console.log(resizedDetections);

    const age = resizedDetections[0].age;
    const gender = resizedDetections[0].gender;

    const interpolatedAge = interpolateAgePredictions(age);
    const middle = {
      x: resizedDetections[0].detection.box.bottomRight.x - 60,
      y: resizedDetections[0].detection.box.bottomRight.y,
    };

    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} years`, `${gender}`],
      middle
    ).draw(canvas);
  }, 100);
});

// Function to get the average of all the ages predicted.
function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 50);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}
