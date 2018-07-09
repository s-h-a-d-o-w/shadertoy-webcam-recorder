import React from 'react';
import styled from 'styled-components';
import GLRenderer from '../utils/GLRenderer.js';
import * as Recorder from '../utils/Recorder.js';

import {connect} from 'react-redux';
import {addDebugInfo, ffmpegLoaded, hideLightbox, webcamAccess} from '../actions';

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
	state = {startedRenderer: false};
	refCanvas = React.createRef();
	refVideo = React.createRef();
	refAudio = React.createRef();

	componentDidMount = () => {
		// Get webcam stream
		const constraints = {
			audio: true,
			// TODO: Possible problem on Chrome (desktop): Unlike Firefox, user doesn't get prompted to choose which camera to use
			video: {
				width: {ideal: 1920}, // 4K would be possible with Chrome on phones but... too much for the browser to handle :/
				height: {ideal: 1080},
				frameRate: {ideal: 30}, // 60 fps might be possible on some devices but... see 4K above.
			}
			/*
			video: {
				width: {ideal: 640}, // 4K would be possible with Chrome on phones but... too much for the browser to handle :/
				height: {ideal: 480},
				frameRate: {ideal: 30}, // 60 fps might be possible on some devices but... see 4K above.
			}
			*/
		};

		const getUserMediaSuccess = (stream) => {
			this.stream = stream;

			const videoTracks = stream.getVideoTracks();
			const videoSettings = videoTracks[0].getSettings();
			console.log('Using video device:', videoTracks[0].label);
			console.log('Stream settings:', videoSettings);

			console.log('Setting canvas size based on video stream');
			this.refCanvas.current.width = videoSettings.width;
			this.refCanvas.current.height = videoSettings.height;
			this.handleResize(); // trigger manually once to calculate current scale

			this.props.dispatch(hideLightbox());
			this.props.dispatch(webcamAccess(true));
			this.props.dispatch(
				addDebugInfo(`${videoSettings.width}x${videoSettings.height}@${videoSettings.frameRate}fps`)
			);

			this.refVideo.current.srcObject = stream;

			// Necessary because we need separate audio and getting it directly from the stream
			// doesn't work. (Seems when using the stream directly, one HAS to record video/audio at once)
			this.refAudio.current.srcObject = stream;
		};

		const getUserMediaError = (error) => {
			// TODO: Show a more generic pop up error (but include an error ID for debugging?) to user

			if(error.name === 'ConstraintNotSatisfiedError') {
				console.error('The resolution ' + constraints.video.width.exact + 'x' +
					constraints.video.height.exact + ' px is not supported by your device.');
			} else if(error.name === 'PermissionDeniedError') {
				console.error('Permissions have not been granted to use your camera and ' +
					'microphone, you need to allow the page access to your devices in ' +
					'order for the demo to work.');
			}
			console.error('getUserMedia error: ' + error.name, error);
		};

		navigator.mediaDevices.getUserMedia(constraints)
		.then(getUserMediaSuccess)
		.catch(getUserMediaError);

		window.addEventListener('resize', () => {requestAnimationFrame(this.handleResize)});
	};

	// Needed for HMR
	componentWillUnmount = () => {
		this.renderer.stop();
		this.renderer = null;
	};

	// Resizes canvas while keeping aspect ratio
	handleResize = () => {
		const cnv = this.refCanvas.current;
		const videoSettings = this.stream && this.stream.getVideoTracks()[0].getSettings();
		if(cnv && videoSettings) {
			// TODO: Would be nice to use cnv.parentNode as base for scale calculation instead of
			// window but offsetWidth/-Height didn't work (reported dimensions a bit too small).
			const scale = Math.min(
				window.innerWidth / videoSettings.width,
				window.innerHeight / videoSettings.height
			);

			cnv.style.transform = `translate(-50%, -50%) scale(${scale})`;
		}
	};

	// Kicks off canvas rendering once stream starts to play
	videoPlaying = () => {
		// Listener is trigger twice in quick succession but should only be executed once.
		if(this.state.startedRenderer) return;
		this.setState({startedRenderer: true});

		console.log('Starting WebGL rendering');
		this.renderer = new GLRenderer();
		this.renderer.start(this.refCanvas.current.getContext('webgl2'), this.refVideo.current);

		// Capturing stream reduces framerate to ~30 FPS (at least on my machine) and can't be separated
		// into a different thread. So start it here to avoid sudden fps drop on Recording.
		Recorder.init({
			canvas: this.refCanvas.current,
			fps: this.refVideo.current.srcObject.getVideoTracks()[0].getSettings().frameRate,
			audio: this.refAudio.current,
			onffmpegloaded: () => this.props.dispatch(ffmpegLoaded(true)),
			onffmpegfailed: () => this.props.dispatch(ffmpegLoaded(false)),
		});
	};

	render = () => {
		console.log('render');
		return (
			<StyledWebcam>
				<StyledCanvas innerRef={this.refCanvas} />
				<video autoPlay muted
					onPlaying={this.videoPlaying}
					ref={this.refVideo}
					style={{width: '0px', height: '0px'}}
				/>
				<audio autoPlay muted
					ref={this.refAudio}
				/>
			</StyledWebcam>
		);
	};
}

export default connect()(Webcam);
