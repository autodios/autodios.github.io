/*
 
  Referencing: 
  J. Karlsson, 2018
   * three.js
   * THREE.OrbitControls (which I have in another Pen) 
*/

// 2d and web cam stuff
let paola = false;
let canvas;
let ctx;
let w;
let h;
let size = 6;
let video;
let video2;
let counter = 0;

// three.js stuff
let colors;
let scene;
let camera;
let renderer;
let cubes;
let nrOfCubesX;
let nrOfCubesY;
let counterS = 0;
//var mAudioElement = document.getElementById('song');

const iframeTest = document.createElement('iframe');
iframeTest.src = "./silence.mp3";
iframeTest.allow = "autoplay";
iframeTest.autoplay = true;
iframeTest.id = "audio";
iframeTest.style.cssText += "display:none;";
document.body.appendChild(iframeTest);

const audio = new Audio();
audio.src = "./COMOTODO.mp3";
audio.controls = true;
audio.allow = 'autoplay';
audio.autoplay = true;
audio.crossOrigin = "anonymous";
audio.id = "player";
audio.style.cssText += "display:none;";
document.body.appendChild(audio);

//var audio = document.createElement('video');
//audio.src = "./COMOTODO.mp3";
//audio.controls = true;
//audio.allow = 'autoplay';
//audio.autoplay = true;
//audio.crossOrigin = "anonymous";
//audio.id = "player";
//document.body.appendChild(audio);


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let verifyaudio;
/*var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
if (!isChrome){
    removeplayer = document.getElementById('#iframePlayer');
    removeplayer.remove();
    verifyaudio = audioCtx.createMediaElementSource(audio);
}
else {
    removeplayer = document.getElementById('player');
    removeplayer.remove(); // just to make sure that it will not have 2x audio in the background
    verifyaudio = audioCtx.createMediaElementSource(ifrm);
}*/
const source = audioCtx.createMediaElementSource(audio);
//const source = verifyaudio;
const volumeControl = audioCtx.createGain();
source.connect(audioCtx.destination);
source.connect(volumeControl);

const analyzer = audioCtx.createAnalyser();
volumeControl.connect(analyzer);
analyzer.connect(audioCtx.destination);

//connect the volume adjustments from the user
volumeControl.gain.value = audio.volume;

//document.getElementById('audioButton').addEventListener("mouseup", playPause, false);
//document.getElementById('audioButton').addEventListener("touchend", playPause, false);



function playPause(){
    var mediaPlayer = document.getElementById('player');
    /*if (!isChrome){
        mediaPlayer = document.getElementById('player');
    }
    else {
    	mediaPlayer = document.getElementById('iframePlayer');
    }*/
    if (mediaPlayer.paused) {
        mediaPlayer.play();
	document.getElementById("audioButton").style.background = "green";
    } else {
        mediaPlayer.pause();
	document.getElementById("audioButton").style.background = "red";
    }
}

function setup() {
  setupColors();
  setupScene();
  setupRenderer();
  setupEventListeners();

  setupCanvas();
  setupWebCamera().then(() => {
    // We need to call these after 
    // the web cam is setup so we 
    // know the width and height 
    // of the video feed
    reset();
    setupCamera();
    setupCubes();
    setupLights();
    draw();
  });
}

function setupCanvas() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
}

function reset() {
  w = canvas.width = video.videoWidth;
  h = canvas.height = video.videoHeight;
  nrOfCubesX = Math.round(w / size);
  nrOfCubesY = Math.round(h / size);
  
  //nrOfCubesX = 2048;
  //nrOfCubesY = 2048;
}

function setupWebCamera() {
  return new Promise((resolve, reject) => {
    let constraints = { audio: false, video: true };
    navigator.mediaDevices.getUserMedia(constraints).
    then(mediaStream => {
      video = document.querySelector("video");
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    }).
    catch(err => {
      console.log(err.name + ": " + err.message);
      reject(err);
    });
  });
}

function setupWebCamera2() {
	var constraints = { audio: true, video: { width: 1280, height: 720 } }; 

    navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function (stream) {
                        video2.srcObject = stream;
                    }).catch(function (error) {
                        console.log("Something went wrong");
                    });
}




// Trying to be clever and keep all grayscale colors
// in a lookup table. Will we avoid some GCs?
function setupColors() {
  colors = new Map();
  for (let i = 0; i < 256; i++) {
	let c = new THREE.Color(`rgb(${i}, ${i}, ${i})`);
	//let c = new THREE.Color(`rgb(166, 240, 4)`);
	//if (i > 1){
    // c = new THREE.Color(`rgb(${i}, ${i}, ${i})`);
	//}
    colors.set(i, c);
  }
}

function paolaSetupColors(pixels) {
  colors = new Map();
  for (let i = 0; i < 256; i++) {
	c = new THREE.Color(`rgb(pixels[index], pixels[index + 1], pixels[index + 2])`);
    colors.set(i, c);
  }
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true });

  renderer.setSize(
  window.innerWidth,
  window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function setupCamera() {
  let res = window.innerWidth / window.innerHeight;
  let z = Math.round(1 / size * 500);
  camera = new THREE.PerspectiveCamera(
  110,
  res,
  0.1,
  1000);
  camera.position.set(nrOfCubesX / 2, nrOfCubesY / 2, z);

  let controls = new THREE.OrbitControls(camera);
  controls.target.set(nrOfCubesX / 2, nrOfCubesY / 2, 0);
  controls.update();
}

function setupCubes() {
  //setupWebCamera2();
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  cubes = [];
  let color = new THREE.Color(`rgb(0, 256, 256)`);
  for (let x = 0; x < nrOfCubesX; x++) {
    for (let y = 0; y < nrOfCubesY; y++) {
      let material = new THREE.MeshStandardMaterial({
        roughness: 0.1,
        color: color });

      let cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, y, 0);
      scene.add(cube);
      cubes.push(cube);
    }
  }
}

function setupLights() {
  let ambientLight = new THREE.AmbientLight(0x777777);
  scene.add(ambientLight);

  let spotLight = new THREE.SpotLight(0xbbbbbb);
  spotLight.position.set(400, nrOfCubesY, 500);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function draw() {
  var freqData = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(freqData);
  requestAnimationFrame(draw);
  ctx.drawImage(video, 0, 0, w, h);
  pixelate(freqData);
  renderer.render(scene, camera);
}


function pixelate(freqData) {
  let imageData = ctx.getImageData(0, 0, w, h);
  let pixels = imageData.data;
  cubes.forEach(cube => {
    let x = cube.position.x;
    let y = cube.position.y;
	//console.log("X", x, "Y", y)
    let col = getAverage(pixels, w - x * size, h - y * size, freqData);
    //let c = Math.round(col);
    //cube.material.color = colors.get(c);
    //cube.material.color = new THREE.Color("rgb("+r+","+g+","+b+")");
    cube.material.color = new THREE.Color("rgb("+pixels[((w - x * size) + w * (h - y * size)) * 4]+","+pixels[(((w - x * size) + w * (h - y * size)) * 4)+1]+","+pixels[(((w - x * size) + w * (h - y * size)) * 4)+2]+")");
	
    let freq = numscale(freqData[0], 0, 600, 0.5, 6);
	
    let z = col / 10 + 0.0 * freq;
	z = z*freq;
	//console.log(z);
    cube.scale.z = z;
    cube.position.z = z / 2;
	counter += 1;
  });
}

function getAverage(pixels, x0, y0, freqData) {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let x = x0; x < x0 + size; x += 1) {
    for (let y = y0; y < y0 + size; y += 1) {
      let index = (x + w * y) * 4;
      r += pixels[index];
      g += pixels[index + 1];
      b += pixels[index + 2];
    }
  }
  //freq = numscale(freqData[0], 0, 300, 1, 2);
  //console.log(r, g, b);
  let val = (0.2126 * r + 0.7152 * g + 0.0722 * b) / (size * size);
  return isNaN(val) ? 1 : val;
}

const numscale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect =
  window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
  window.innerWidth,
  window.innerHeight);
}



setup();
