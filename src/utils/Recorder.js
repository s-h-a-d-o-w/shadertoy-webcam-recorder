// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
// And: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html

let ffmpeg;

let videoStream;
let videoRecorder;
let videoBlobs;

let audioStream;
let audioRecorder;
let audioBlobs;

function init(canvas, fps, audio) {
	videoStream = canvas.captureStream(fps);
	audioStream = audio;

	// TODO: This freezes the browser. Better solution?
	import(/* webpackChunkName: "ffmpeg" */ '../ffmpeg/ffmpeg-webm.js').then(module => {
		ffmpeg = module.default;
		console.log('ffmpeg loaded!');
	});

	/*
	fetch('assets/testv.webm').then((response) => {
		if(response.ok) {
			response.arrayBuffer().then(data => {
				videoBuffer = data;
				console.log('testv.webm loaded');
			});
		}
		else {
			var error = new Error(response.statusText + ' ' + response.url);
			throw error;
		}
	}, function(error) {
		console.error(error);
	});

	fetch('assets/testa.webm').then((response) => {
		if(response.ok) {
			response.arrayBuffer().then(data => {
				audioBuffer = data;
				console.log('testa.webm loaded');
			});
		}
		else {
			var error = new Error(response.statusText + ' ' + response.url);
			throw error;
		}
	}, function(error) {
		console.error(error);
	});
	*/
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
	let options = {mimeType: 'video/webm'};
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
			console.log('Video Chunk:');
			console.log(event.data);
			videoBlobs.push(event.data);
		}
	};

	audioRecorder = new MediaRecorder(audioStream.mozCaptureStream());
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

function getObjectURL() {
	// TODO: Use the web worker version instead
	return new Promise((resolve, reject) => {
		let videoBuffer;
		let fileReader = new FileReader();
		fileReader.onload = function() {
			videoBuffer = this.result;

			let audioBuffer;
			let fileReaderInner = new FileReader();
			fileReaderInner.onload = function() {
				audioBuffer = this.result;

				let result = ffmpeg({
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
					],
					// Ignore stdin read requests.
					stdin: function() {},
				});

				resolve(window.URL.createObjectURL(new Blob([result.MEMFS[0].data.buffer])));
			};
			//fileReaderInner.readAsArrayBuffer(audioBlobs[0]);
			fileReaderInner.readAsArrayBuffer(new Blob(audioBlobs));
		};
		//fileReader.readAsArrayBuffer(videoBlobs[0]);
		fileReader.readAsArrayBuffer(new Blob(videoBlobs));
	});

}


export {init, startRecording, stopRecording, getObjectURL};
