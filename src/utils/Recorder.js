// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
// And: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html

let ffmpegWorker;

let videoStream;
let videoRecorder;
let videoBlobs;

let audioStream;
let audioRecorder;
let audioBlobs;

function init(opts) {
	// Could of course call captureStream() only directly before recording.
	// Problem: frame rate would suddenly drop during recording. BAD UX!
	videoStream = opts.canvas.captureStream(opts.fps);
	let audioStreamCapture = opts.audio.captureStream || opts.audio.mozCaptureStream;
	audioStream = audioStreamCapture.call(opts.audio);

	// See ffmpeg.js docs
	ffmpegWorker = new Worker('ffmpeg-worker-webm.js'); // Copying of this script is specified manually in webpack config
	ffmpegWorker.onmessage = function(e) {
		const msg = e.data;
		if(msg.type === "ready") {
			console.log('ffmpeg loaded!');
			opts.onffmpegloaded();
		}
	};
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
	videoBlobs = [];
	audioBlobs = [];

	// Create video recorder
	videoRecorder = new MediaRecorder(videoStream, {
		mimeType: 'video/webm;codecs=vp8', // ensure that VP8 is used, since ffmpeg.js only works with this as of right now

		// Bit rate is only a target - actual output usually has a much lower one.
		// Seems to depend on content, as a crosshatch shader will result in a much higher
		// bit rate (~13 MBit) versus simply passing through webcam stream (~7 MBit).
		videoBitsPerSecond: 30 * 1000 * 1000,
	});
	videoRecorder.ondataavailable = (event) => {
		if(event.data && event.data.size > 0) {
			videoBlobs.push(event.data);
		}
	};

	// Create audio recorder
	audioRecorder = new MediaRecorder(audioStream, {
		audioBitsPerSecond: 200 * 1000, // Firefox seems to respect this
	});
	audioRecorder.ondataavailable = (event) => {
		if(event.data && event.data.size > 0) {
			audioBlobs.push(event.data);
		}
	};

	// Collect 1000 ms chunks of data
	videoRecorder.start(1000);
	audioRecorder.start(1000);

	console.log('MediaRecorder started', videoRecorder);
}

function stopRecording() {
	return new Promise((resolve, reject) => {
		let isDone = {
			audio: false,
			video: false,
		};

		videoRecorder.onstop = () => {
			isDone.audio ? resolve() : isDone.video = true;
		}
		audioRecorder.onstop = () => {
			isDone.video ? resolve() : isDone.audio = true;
		}

		audioRecorder.stop();
		videoRecorder.stop();
	});
}

/**
	Uses ffmpeg.js web worker version to merge video and audio streams.

	@return {DOMString} Represents the blob of the recorded webm file
 */
function getObjectURL() {
	return new Promise((resolve, reject) => {
		let videoBuffer;
		let fileReader = new FileReader();
		fileReader.onload = function() {
			videoBuffer = this.result;

			let audioBuffer;
			let fileReaderInner = new FileReader();
			fileReaderInner.onload = function() {
				audioBuffer = this.result;

				// Resolve once worker is done merging video and audio
				ffmpegWorker.onmessage = function(e) {
					var msg = e.data;
					if(msg.type === "stderr") {
						console.log('ffmpeg: ' + msg.data);
					}
					else if(msg.type === "done") {
						resolve(window.URL.createObjectURL(new Blob([msg.data.MEMFS[0].data.buffer])));
					}
				};

				ffmpegWorker.postMessage({
					type: "run",
					MEMFS: [
						{name: "video.webm", data: new Uint8Array(videoBuffer)},
						{name: "audio.webm", data: new Uint8Array(audioBuffer)},
					],
					arguments: [
						'-i', 'video.webm',
						'-i', 'audio.webm',
						'-c:v', 'copy',
						'-c:a', 'copy',
						'output.webm'
					]
				});
			};
			fileReaderInner.readAsArrayBuffer(new Blob(audioBlobs));
		};
		fileReader.readAsArrayBuffer(new Blob(videoBlobs));
	});
}


export {init, startRecording, stopRecording, getObjectURL};
