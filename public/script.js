const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");

var peer = new Peer({
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },

  debug: 3
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
// Obtener la etiqueta de audio
var miAudio = document.getElementById('audioElement');

// Crear una nueva instancia de AudioContext
var audioContext = new AudioContext();

// Crear un nuevo objeto de fuente de audio a partir del stream
var sourceNode = audioContext.createMediaStreamSource(stream);

// Decodificar el stream en un AudioBuffer
audioContext.decodeAudioData(stream, function(buffer) {
  // Asignar el AudioBuffer a una variable
  var audioBuffer = buffer;

  // Crear un nuevo objeto de fuente de audio a partir del AudioBuffer
  var fuente = audioContext.createBufferSource();
  fuente.buffer = audioBuffer;

  // Conectar la fuente de audio al destino de salida
  fuente.connect(audioContext.destination);

  // Crear una instancia de Lame
  var mp3encoder = new lamejs.Mp3Encoder(2, 44100, 192);

  // Iniciar la codificación MP3
  var mp3Data = [];
  var leftChannel = audioBuffer.getChannelData(0);
  var rightChannel = audioBuffer.getChannelData(1);
  for (var i = 0; i < leftChannel.length; i++) {
    var left = Math.max(-1, Math.min(1, leftChannel[i]));
    var right = Math.max(-1, Math.min(1, rightChannel[i]));
    var sample = (left + right) / 2;
    var mp3Sample = mp3encoder.encodeBuffer(sample);
    if (mp3Sample.length > 0) {
      mp3Data.push(mp3Sample);
    }
  }
  mp3Data.push(mp3encoder.flush());

  // Convertir el MP3 a un Blob
  var blob = new Blob(mp3Data, {type: 'audio/mp3'});

  // Guardar el archivo MP3
  saveAs(blob, 'audio.mp3');

  // Reproducir la etiqueta de audio
  miAudio.srcObject = fuente;
  miAudio.play();
});


    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});

const videoElem = document.getElementById("video");
      const startElem = document.getElementById("start");
      const stopElem = document.getElementById("stop");
      // Options for getDisplayMedia()
      var displayMediaOptions = {
          video: {
              cursor: "always",
              height: 1000,
              width: 1200
          },
          audio: false
      };
      // Set event listeners for the start and stop buttons
      startElem.addEventListener("click", function (evt) {
          startCapture();
      }, false);
      // Stop the screen capture
      stopElem.addEventListener("click", function (evt) {
          stopCapture();
      }, false);
      // Start the screen capture
      async function startCapture() {
          try {
              videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
              dumpOptionsInfo();
          } catch (err) {
              // Handle error
              console.error("Error: " + err);
          }
      }
      // Stop the stream
      function stopCapture(evt) {
          let tracks = videoElem.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          videoElem.srcObject = null;
      }
      // Dump the available media track capabilities to the console
      function dumpOptionsInfo() {
          const videoTrack = videoElem.srcObject.getVideoTracks()[0];
          console.info("Track settings:");
          console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
          console.info("Track constraints:");
          console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}