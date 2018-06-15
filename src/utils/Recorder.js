// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
// And: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html

let ffmpegWorker;

let videoStream;
let videoRecorder;
let videoBlobs;

let audioStream;
let audioRecorder;
let audioBlobs;

function init(canvas, fps, audio) {
	videoStream = canvas.captureStream(fps);
	audioStream = audio;

	// See ffmpeg.js docs
	ffmpegWorker = new Worker('../ffmpeg/ffmpeg-worker-webm.js');
	ffmpegWorker.onmessage = function(e) {
		var msg = e.data;
		if(msg.type === "ready")
			console.log('ffmpeg loaded!');
	};
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
	let options = {
		mimeType: 'video/webm',
		videoBitsPerSecond: 15000000,
	};
	videoBlobs = [];
	audioBlobs = [];

	try {
		videoRecorder = new MediaRecorder(videoStream, options);
	} catch(e0) {
		console.log('Unable to create MediaRecorder with options Object: ', e0);
		try {
			options = {mimeType: 'video/webm,codecs=vp9'};
			videoRecorder = new MediaRecorder(videoStream, options);
		} catch(e1) {
			console.log('Unable to create MediaRecorder with options Object: ', e1);
			try {
				options = 'video/vp8'; // Chrome 47
				videoRecorder = new MediaRecorder(videoStream, options);
			} catch(e2) {
				alert('MediaRecorder is not supported by this browser.\n\n' +
					'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
				console.error('Exception while creating MediaRecorder:', e2);
				return;
			}
		}
	}
	console.log('Created MediaRecorder', videoRecorder, 'with options', options);

	// Push recorded chunks
	videoRecorder.ondataavailable = (event) => {
		if(event.data && event.data.size > 0) {
			videoBlobs.push(event.data);
		}
	};

	let captureStream = audioStream.captureStream || audioStream.mozCaptureStream;
	audioRecorder = new MediaRecorder(captureStream.call(audioStream), {
		//mimeType: 'audio/webm',
		audioBitsPerSecond: 128000,
	});
	audioRecorder.ondataavailable = (event) => {
		if(event.data && event.data.size > 0) {
			audioBlobs.push(event.data);
		}
	};

	// Collect 1000ms chunks of data
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
