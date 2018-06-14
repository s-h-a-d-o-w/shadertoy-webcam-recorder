// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js

/*
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
*/
let streamAudio;
var streamVideo;
let audioRecorder;
var videoRecorder;
var recordedBlobs;
//var sourceBuffer;

/*
function handleSourceOpen(event) {
	console.log('MediaSource opened');
	sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
	console.log('Source buffer: ', sourceBuffer);
}
*/

function init(canvas, fps, audio) {
	streamVideo = canvas.captureStream(fps);
	streamAudio = audio;
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
	let options = {mimeType: 'video/webm'};
	recordedBlobs = [];

	try {
		videoRecorder = new MediaRecorder(streamVideo, options);
	} catch(e0) {
		console.log('Unable to create MediaRecorder with options Object: ', e0);
		try {
			options = {mimeType: 'video/webm,codecs=vp9'};
			videoRecorder = new MediaRecorder(streamVideo, options);
		} catch(e1) {
			console.log('Unable to create MediaRecorder with options Object: ', e1);
			try {
				options = 'video/vp8'; // Chrome 47
				videoRecorder = new MediaRecorder(streamVideo, options);
			} catch(e2) {
				alert('MediaRecorder is not supported by this browser.\n\n' +
					'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
				console.error('Exception while creating MediaRecorder:', e2);
				return;
			}
		}
	}
	console.log('Created MediaRecorder', videoRecorder, 'with options', options);

	// Push recorded chunks to recordedBlobs
	videoRecorder.ondataavailable = (event) => {
		if(event.data && event.data.size > 0) {
			recordedBlobs.push(event.data);
		}
	};
	videoRecorder.start(1000); // Collect 1000ms chunks of data

	console.log('MediaRecorder started', videoRecorder);
}

function stopRecording() {
	videoRecorder.stop();
	console.log('Recorded Blobs: ', recordedBlobs);
}

function getObjectURL() {
	return window.URL.createObjectURL(new Blob(
		recordedBlobs,
		{type: 'video/webm'})
	);
}


/*

// https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html

var worker;



var workerPath = 'https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js';
if(document.domain == 'localhost') {
	workerPath = location.href.replace(location.href.split('/').pop(), '') + 'ffmpeg_asm.js';
}
function processInWebWorker() {
	var blob = URL.createObjectURL(new Blob([
		'importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};'+
		'onmessage = function(event) {var message = event.data;if (message.type === "command") '+
		'{var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: 268435456};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
		type: 'application/javascript'
	}));
	var worker = new Worker(blob);
	URL.revokeObjectURL(blob);
	return worker;
}





function mergeStreams(videoBlob, audioBlob) {
	var vab;
	var aab;
	var buffersReady;
	var workerReady;
	var posted = false;

	var fileReader1 = new FileReader();
	fileReader1.onload = function() {
		vab = this.result;
		if (aab) buffersReady = true;
		if (buffersReady && workerReady && !posted) postMessage();
	};
	var fileReader2 = new FileReader();
	fileReader2.onload = function() {
		aab = this.result;
		if (vab) buffersReady = true;
		if (buffersReady && workerReady && !posted) postMessage();
	};
	fileReader1.readAsArrayBuffer(videoBlob);
	fileReader2.readAsArrayBuffer(audioBlob);

	if (!worker) {
		worker = processInWebWorker();
	}
	worker.onmessage = function(event) {
		var message = event.data;
		if (message.type == "ready") {
			log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file has been loaded.');
			workerReady = true;
			if (buffersReady)
				postMessage();
		} else if (message.type == "stdout") {
			log(message.data);
		} else if (message.type == "start") {
			log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file received ffmpeg command.');
		} else if (message.type == "done") {
			log(JSON.stringify(message));
			var result = message.data[0];
			log(JSON.stringify(result));
			var blob = new Blob([result.data], {
				type: 'video/mp4'
			});
			log(JSON.stringify(blob));
			PostBlob(blob);
		}
	};

	var postMessage = function() {
		posted = true;

		worker.postMessage({
			type: 'command',
			arguments: [
				'-i', 'video.webm',
				'-i', 'audio.wav',
				'-c:v', 'mpeg4',
				'-c:a', 'vorbis', // or aac
				'-b:v', '6400k',  // or 1450k
				'-b:a', '4800k',  // or 96k
				'-strict', 'experimental', 'output.mp4'
			],
			files: [
				{
					data: new Uint8Array(vab),
					name: 'video.webm'
				},
				{
					data: new Uint8Array(aab),
					name: "audio.wav"
				}
			]
		});
	};
}
*/


export {init, startRecording, stopRecording, getObjectURL};
