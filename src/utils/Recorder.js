// Based on: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
// And: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/ffmpeg/audio-plus-canvas-recording.html
import {progress} from '../actions';

let ffmpegWorker;
let mergeWorker;

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
	// Problem: frame rate would suddenly drop during recording => BAD UX!
	videoStream = opts.canvas.captureStream(opts.fps);
	const audioStreamCapture = opts.audio.captureStream || opts.audio.mozCaptureStream;
	audioStream = audioStreamCapture.call(opts.audio);

	// TODO: Use worker-loader instead: https://github.com/webpack-contrib/worker-loader
	mergeWorker = new Worker('mergeBlobsWorker.js');

	// See ffmpeg.js docs
	let retries = 0;
	const loadffmpeg = () => {
		ffmpegWorker = new Worker('ffmpeg-worker-webm.js'); // Copying of this script is specified manually in webpack config
		ffmpegWorker.onmessage = (e) => {
			const msg = e.data;
			if(msg.type === 'ready') {
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
	};
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

	// Collect X ms chunks of data
	videoRecorder.start(1000);
	audioRecorder.start(1000);

	console.log('MediaRecorder started', videoRecorder);
}

function stopRecording() {
	console.log('Recorder.stopRecording()');
	return new Promise((resolve) => {
		const isDone = {
			audio: false,
			video: false,
		};

		videoRecorder.onstop = () => {
			isDone.audio ? resolve() : isDone.video = true;
		};
		audioRecorder.onstop = () => {
			isDone.video ? resolve() : isDone.audio = true;
		};

		recDuration = (new Date()) - recStart;
		videoRecorder.stop();
		audioRecorder.stop();
	});
}

/**
	Uses ffmpeg.js web worker version to merge video and audio streams.

	@return {Promise.<string>} Represents the blob of the recorded webm file
 */
function getObjectURL(dispatch) {
	console.log('getObjectURL()');
	return new Promise((resolve, reject) => {
		mergeWorker.onmessage = (msg) => {
			if(msg.data.hasOwnProperty('progress') && msg.data.type === 'video') {
				// Progress for this should only take up 0-50%, rest will be ffmpeg
				// Don't use progress of audio, since it's negligible (200 kbit stream vs. 5-15 mbit...)
				dispatch(progress(Math.round(msg.data.progress * 0.5 * 100)));
			}
			else if(msg.data instanceof Array) {
				// Resolve once worker is done merging video and audio
				ffmpegWorker.onmessage = (e) => {
					const ffmpegMsg = e.data;
					if(ffmpegMsg.type === 'stderr') {
						console.log('ffmpeg: ' + ffmpegMsg.data);

						// ffmpeg reports progress containing time stamps.
						// e.g.: time=00:00:04.33
						if(ffmpegMsg.data.indexOf('time=') >= 0) {
							const ffmpegTime = ffmpegMsg.data.match(/time=(.*?) /)[1];

							let muxProgress = Date.parse(`1970-01-01T${ffmpegTime}0Z`) / recDuration;
							if(muxProgress > 1)
								muxProgress = 1;

							// ffmpeg muxing uses progress range 60-100%
							dispatch(progress(Math.round((muxProgress * 0.4 + 0.6) * 100)));
						}
						else if(ffmpegMsg.data.indexOf('ffmpeg version') >= 0) {
							// ffmpeg started
							dispatch(progress(53));
						}
						else if(ffmpegMsg.data.indexOf('Input #0') >= 0) {
							dispatch(progress(56));
						}
						else if(ffmpegMsg.data.indexOf('Output #0') >= 0) {
							// close to starting to mux the data
							dispatch(progress(60));
						}
					}
					else if(ffmpegMsg.type === 'done') {
						resolve(window.URL.createObjectURL(new Blob([ffmpegMsg.data.MEMFS[0].data.buffer])));
					}
				};

				console.log('duration:', recDuration);

				console.log('before sending to ffmpeg.');
				ffmpegWorker.postMessage({
					type: 'run',
					MEMFS: msg.data,
					arguments: [
						'-i', 'video.webm',
						'-i', 'audio.webm',
						'-c:v', 'copy',
						'-c:a', 'copy',
						'output.webm',
					],
				});
				console.log('after sending to ffmpeg.');
			}
		};

		mergeWorker.postMessage({
			video: videoBlobs,
			audio: audioBlobs,
		});
	});
}

export {init, startRecording, stopRecording, getObjectURL};
