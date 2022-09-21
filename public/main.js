const elStartRecord = document.getElementById("startRecord");
const elStopRecord = document.getElementById("stopRecord");
const elStartCamera = document.getElementById("startCamera");
const elStopCamera = document.getElementById("stopCamera");
const elLiveVideo = document.getElementById("live-video");
const elRecordedVideo = document.getElementById("recorded-video");

elStartCamera.onclick = () => {
  elStartCamera.hidden = true;
  elStopCamera.hidden = false;
  elStartRecord.hidden = false;
  elLiveVideo.style.display = "block";

  var recorder;
  var mediaStream;
  var fileName;
  var connection;

  function getVideoStream() {
    navigator.mediaDevices

      /*.getUserMedia({
        audio: true,
        video: true,
      })
      */
      .getDisplayMedia({
        video: {
          mediaSource: "screen",
        },
      })
      .then(function (stream) {
        mediaStream = stream;
        elLiveVideo.srcObject = mediaStream;
        getRecorder();
      });
  }

  function getRecorder() {
    var options = { mimeType: "video/webm", audioBitsPerSecond: 128000 };
    recorder = new MediaRecorder(mediaStream, options);
    recorder.ondataavailable = videoDataHandler;
  }

  function videoDataHandler(event) {
    console.log("Got Chunk");
    var reader = new FileReader();
    reader.readAsArrayBuffer(event.data);
    reader.onloadend = function (event) {
      console.log("About to send chunk");
      connection.send(reader.result);
    };
  }

  function getWebSocket() {
    var websocketEndpoint = "ws://localhost:3000";
    //var websocketEndpoint = "wss://puki.ninja";
    connection = new WebSocket(websocketEndpoint);
    connection.binaryType = "arraybuffer";
    connection.onmessage = function (message) {
      fileName = message.data;
    };
  }

  function updateVideoFile() {
    var videoUrl = "http://localhost:3000/uploads/" + fileName + ".webm";
    //var videoUrl = "http://puki.ninja/uploads/" + fileName + ".webm";
    elRecordedVideo.setAttribute("src", videoUrl);

    elRecordedVideo.style.display = "block";

    document.querySelector(
      "#videoList"
    ).innerHTML += `<li><a  target="_blank" href="${videoUrl}">${videoUrl}</a></li>`;
  }

  elStartRecord.onclick = function (e) {
    // 1 sec chunks
    recorder.start(1000);
    elStartRecord.hidden = true;
    elStopRecord.hidden = false;
    elStopCamera.hidden = true;
    elRecordedVideo.style.display = "none";
  };

  elStopRecord.onclick = function (e) {
    recorder.stop();
    updateVideoFile();
    // Ugly fix, need to wait for the last chunk to finish before switching to a new fileName
    setTimeout(() => {
      connection.send("DONE");
    }, 1000);
    elStartRecord.hidden = false;
    elStopRecord.hidden = true;
    elStopCamera.hidden = false;
  };

  getVideoStream();
  getWebSocket();
};

elStopCamera.onclick = () => {
  elLiveVideo.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  document.getElementById("status").innerHTML = "Camera stopped";
  console.log("recorder stopped");
  elStartCamera.hidden = false;
  elStopCamera.hidden = true;
  elStartRecord.hidden = true;
  elRecordedVideo.style.display = "none";
  elLiveVideo.style.display = "none";
};
