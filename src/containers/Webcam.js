import React from 'react';
import styled from 'styled-components';
import GLRenderer from '../utils/GLRenderer.js';
import * as Recorder from '../utils/Recorder.js';

const StyledWebcam = styled.div`
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
`;

const StyledCanvas = styled.canvas`
	position: relative;
	left: 50%;
	top: 50%;
	transform-origin: center center;
`;

class Webcam extends React.Component {
	constructor(props) {
		super(props);
		this.refCanvas = React.createRef();
	}

	// Kicks off canvas rendering once stream starts to play
	addVideoPlayingListener = () => {
		let done = false;
		this.video.addEventListener('playing', () => {
			// Listener is trigger twice in quick succession - too quick
			// for removeEventListener to finish in time.
			// But this should only be executed once.
			if(done) return;
			done = true;

			console.log('Starting WebGL rendering');
			this.renderer = new GLRenderer();
			this.renderer.start(this.refCanvas.current.getContext('webgl2'), this.video);


			// TODO: Could using a web worker for recording resolve this issue?

			// Reduces framerate to ~30 FPS (at least on my machine)
			Recorder.init(
				this.refCanvas.current,
				this.video.srcObject.getVideoTracks()[0].getSettings().frameRate,
				this.audio
			);
		}, true);
	};

	componentDidMount = () => {
		// Prepare video tag and its event listeners that will receive webcam stream
		this.video = document.createElement('video');
		this.video.autoplay = true;
		this.video.style.display = 'none';
		this.addVideoPlayingListener();

		this.audio = document.createElement('audio');
		this.audio.autoplay = true;
		this.audio.style.display = 'none';


		// TODO: Remove this on release? It's just annoying to hear stuff while developing...
		// Recording is not affected.
		this.video.muted = 'muted';
		this.audio.muted = 'muted';


		// Get webcam stream
		const constraints = {
			audio: true,
			// TODO: Since getCapabilities() still isn't supported, do the trial & error workaround for
			// finding max. resolution...
			video: { width: {exact: 1280}, height: {exact: 720} }
		};

		const handleSuccess = (stream) => {
			const videoTracks = stream.getVideoTracks();
			const videoSettings = videoTracks[0].getSettings();
			console.log('Using video device:', videoTracks[0].label);
			console.log('Stream settings:', videoSettings);

			console.log('Setting canvas size based on video stream');
			this.refCanvas.current.width = videoSettings.width;
			this.refCanvas.current.height = videoSettings.height;
			this.handleResize(); // trigger once to calculate current scale

			this.video.srcObject = stream;

			// Necessary because we need separate audio and getting it directly from the stream
			// doesn't work. (Seems when using the stream directly, one HAS to record video/audio at once)
			this.audio.srcObject = stream;
		};

		const handleError = (error) => {
			// TODO: Show a more generic pop up error (but include an error ID for debugging?) to user

			if(error.name === 'ConstraintNotSatisfiedError') {
				console.error('The resolution ' + constraints.video.width.exact + 'x' +
					constraints.video.width.exact + ' px is not supported by your device.');
			} else if(error.name === 'PermissionDeniedError') {
				console.error('Permissions have not been granted to use your camera and ' +
					'microphone, you need to allow the page access to your devices in ' +
					'order for the demo to work.');
			}
			console.error('getUserMedia error: ' + error.name, error);
		};

		navigator.mediaDevices.getUserMedia(constraints)
		.then(handleSuccess)
		.catch(handleError);


		/*
		// Get audio
		navigator.mediaDevices.getUserMedia({audio: true, video: false})
		.then((stream) => {
			let oida = new MediaRecorder(stream, {mimeType: 'audio/webm'});
			this.audio = stream;
		})
		.catch(handleError);
		*/


		// Resize canvas to fill parent but keep aspect ratio
		window.addEventListener('resize', () => {requestAnimationFrame(this.handleResize)});
	};

	// Usually only triggered by HMR, so let's restart renderer (to enable e.g. "shader HMR")
	componentDidUpdate = () => {
		this.renderer.stop();
		this.renderer = new GLRenderer();
		this.renderer.start(this.refCanvas.current.getContext('webgl2'), this.video);
	};

	// Resizes canvas while keeping aspect ratio
	handleResize = () => {
		let cnv = this.refCanvas.current;
		if(cnv) {
			// TODO: Would be nice to use cnv.parentNode as base for scale calculation instead of
			// window but offsetWidth/-Height didn't work (reported dimensions a bit too small).
			let scale = Math.min(
				window.innerWidth / 1280, // TODO: replace fixed values with video resolution
				window.innerHeight / 720
			);

			cnv.style.transform = `translate(-50%, -50%) scale(${scale})`;
		}
	};

	render = () => {
		console.log('render');
		return (
			<StyledWebcam>
				<StyledCanvas innerRef={this.refCanvas} />
			</StyledWebcam>
		);
	};
}

export default Webcam;
