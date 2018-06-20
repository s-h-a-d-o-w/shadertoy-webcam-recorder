// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
// And: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html
import {progress} from '../actions';

let ffmpegWorker;

let videoStream;
let videoRecorder;
let videoBlobs;

let audioStream;
let audioRecorder;
let audioBlobs;

let recStart;
let recDuration;

function init(opts) {
	// Could of course call captureStream() only directly before recording.
	// Problem: frame rate would suddenly drop during recording. BAD UX!
	videoStream = opts.canvas.captureStream(opts.fps);
	const audioStreamCapture = opts.audio.captureStream || opts.audio.mozCaptureStream;
	audioStream = audioStreamCapture.call(opts.audio);

	// See ffmpeg.js docs
	let retries = 0;
	const loadffmpeg = () => {
		ffmpegWorker = new Worker('ffmpeg-worker-webm.js'); // Copying of this script is specified manually in webpack config
		ffmpegWorker.onmessage = (e) => {
			const msg = e.data;
			if(msg.type === "ready") {
				console.log('ffmpeg loaded!');
				opts.onffmpegloaded();
			}
		};
		ffmpegWorker.onerror = () => {
			retries++;
			if(retries < 5) {
				console.error('ffmpeg loading failed - retrying...');
				loadffmpeg();
			}
			else {
				opts.onffmpegfailed();
			}
		};
	}
	loadffmpeg();
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

	// Need to keep track of video duration ourselves, not easy to find out otherwise.
	recStart = new Date();

	// Collect 300 ms chunks of data
	videoRecorder.start(300);
	audioRecorder.start(300);

	console.log('MediaRecorder started', videoRecorder);
}

function stopRecording() {
	return new Promise((resolve, reject) => {
		const isDone = {
			audio: false,
			video: false,
		};

		videoRecorder.onstop = () => {
			isDone.audio ? resolve() : isDone.video = true;
		}
		audioRecorder.onstop = () => {
			isDone.video ? resolve() : isDone.audio = true;
		}

		recDuration = (new Date) - recStart;
		videoRecorder.stop();
		audioRecorder.stop();
	});
}

/**
	Uses ffmpeg.js web worker version to merge video and audio streams.

	@return {DOMString} Represents the blob of the recorded webm file
 */
function getObjectURL(dispatch) {
	console.log('getObjectURL()');
	return new Promise((resolve, reject) => {
		blobsToArrayBuffers(videoBlobs, dispatch).then((buffers) => {
			let videoBuffer = arrayBufferConcat(...buffers);
			console.log('videoBuffer done.');

			let audioBuffer;
			const fileReaderInner = new FileReader();
			fileReaderInner.onload = function() {
				console.log('audioBuffer done.');
				audioBuffer = this.result;

				// Resolve once worker is done merging video and audio
				ffmpegWorker.onmessage = function(e) {
					const msg = e.data;
					if(msg.type === "stderr") {
						// ffmpeg is pretty fast anyway, probably no need to show its progress

						// ffmpeg reports progress containing time stamps.
						// e.g.: time=00:00:04.33
						// if(msg.data.indexOf('time=') > 0) {
						// 	const ffmpegTime = msg.data.match(/time=(.*?) /)[1];
						// 	let progress = Date.parse(`1970-01-01T${ffmpegTime}0Z`)) / recDuration;
						// 	if(progress > 1)
						// 		progress = 1;

						// 	// dispatch progress
						// 	console.log('progress:', progress);
						// }

						console.log('ffmpeg: ' + msg.data);
					}
					else if(msg.type === "done") {
						resolve(window.URL.createObjectURL(new Blob([msg.data.MEMFS[0].data.buffer])));
					}
				};

				console.log('duration:', recDuration);

				console.log('before sending to ffmpeg.');
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
				console.log('after sending to ffmpeg.');
			};
			fileReaderInner.readAsArrayBuffer(new Blob(audioBlobs));
		})

	});
}

function blobsToArrayBuffers(blobs, dispatch) {
	let index = 0;
	let buffers = [];

	dispatch(progress(0));

	return new Promise((resolve, reject) => {
		function nextBlobToBuffer() {
			if(index < blobs.length) {
				blobToArrayBuffer(blobs[index++]).then((e) => {
					buffers.push(e.target.result);
					let blub = Math.round((index / blobs.length) * 100);
					console.log(`blub ${blub} / index ${index} / length ${blobs.length}`);
					dispatch(progress(blub));
					nextBlobToBuffer();
				});
			}
			else
				resolve(buffers);
		}
		nextBlobToBuffer();
	});
}

function blobToArrayBuffer(blob) {
	var fileReader = new FileReader();

	return new Promise(function(resolve, reject) {
		fileReader.onload = resolve;
		fileReader.onerror = reject;

		fileReader.readAsArrayBuffer(blob);
	});
};

function arrayBufferConcat () {
	var length = 0;
	var buffer = null;

	for (var i in arguments) {
		buffer = arguments[i];
		length += buffer.byteLength;
	}

	var joined = new Uint8Array(length);
	var offset = 0;

	for (var i in arguments) {
		buffer = arguments[i];
		joined.set(new Uint8Array(buffer), offset);
		offset += buffer.byteLength;
	}

	return joined.buffer;
}

export {init, startRecording, stopRecording, getObjectURL};
