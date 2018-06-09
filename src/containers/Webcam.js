import React from 'react';
import * as GLRenderer from '../utils/GLRenderer.js';

class Webcam extends React.Component {
	componentDidUpdate() {
		// Probably triggered by HMR, so let's restart renderer
		console.log('componentDidUpdate');
		//GLRenderer.stop();
		//GLRenderer.start(this.refCanvas.current.getContext('webgl2'), this.video);
	}

	addPlayingListener = () => {
		let done = false;
		this.video.addEventListener('playing', () => {
			// Listener is trigger twice in quick succession - too quick
			// for removeEventListener to finish in time.
			// But this should only be executed once.
			if(done) return;
			done = true;

			console.log('Stream starts playing.');

			GLRenderer.start(this.refCanvas.current.getContext('webgl2'), this.video);
		}, true);
	};

	constructor() {
		super();
		this.refCanvas = React.createRef();
	}

	componentDidMount() {
		console.log('componentDidMount');

		this.video = document.createElement('video');
		this.video.autoplay = true;
		this.video.style.display = 'none';

		this.addPlayingListener();

		// Put variables in global scope to make them available to the browser console.
		const constraints = {
			audio: false,
			video: { width: {exact: 1280}, height: {exact: 720} }
		};

		const handleSuccess = (stream) => {
			const videoTracks = stream.getVideoTracks();
			console.log('Got stream with constraints:', constraints);
			console.log('Using video device: ' + videoTracks[0].label);
			stream.oninactive = () => console.log('Stream inactive');
			//window.stream = stream; // make variable available to browser console
			this.video.srcObject = stream;
		};

		const handleError = (error) => {
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
	}

	render() {
		console.log('render');
		return (
			<div>
				Webcam:
				<canvas ref={this.refCanvas} width={1280} height={720} />
			</div>
		);
	}
}

export default Webcam;
