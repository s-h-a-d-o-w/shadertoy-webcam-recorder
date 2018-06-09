import React from 'react'

class Video extends React.Component {
	/*
	addPlayingListener(video) {
		let done = false;
		video.addEventListener('playing', function() {
			// Listener is trigger twice in quick succession - too quick
			// for removeEventListener to finish in time.
			// But this should only be executed once.
			if(done) return;
			done = true;

			console.log('Stream starts playing.');

			//var texTemp = loadTexture(gl, '720p-testpattern.png');

			// Draw the scene repeatedly
			function render(now) {
				//stats.begin();

				// Fixed texture: 59 FPS
				// Just streaming stuff from webcam without processing: Chrome 30 FPS, FF 30 FPS
				drawScene(gl, programInfos, buffers, framebuffers, fbTextures, texWebcam, texTemp);

				// request animation frame in updateTexture, since we don't need to render unless there's a new frame
				// from the webcam!
				if(textureUpdateable)
					updateTexture(gl, texWebcam, video, render);
				else
				// need to stupidly loop this until webcam stream becomes available
					requestAnimationFrame(render);

				//stats.end();
				//requestAnimationFrame(render);
			}
			requestAnimationFrame(render);
		}, true);
	}
	*/

	constructor() {
		super();
		this.refVideo = React.createRef();
	}

	componentDidMount() {
		const video = this.refVideo.current;

		// Put variables in global scope to make them available to the browser console.
		const constraints = {
			audio: false,
			video: { width: {exact: 1280}, height: {exact: 720} }
		};

		function handleSuccess(stream) {
			const videoTracks = stream.getVideoTracks();
			console.log('Got stream with constraints:', constraints);
			console.log('Using video device: ' + videoTracks[0].label);
			stream.oninactive = () => console.log('Stream inactive');
			//window.stream = stream; // make variable available to browser console
			video.srcObject = stream;
		}

		function handleError(error) {
			if(error.name === 'ConstraintNotSatisfiedError') {
				console.error('The resolution ' + constraints.video.width.exact + 'x' +
					constraints.video.width.exact + ' px is not supported by your device.');
			} else if(error.name === 'PermissionDeniedError') {
				console.error('Permissions have not been granted to use your camera and ' +
					'microphone, you need to allow the page access to your devices in ' +
					'order for the demo to work.');
			}
			console.error('getUserMedia error: ' + error.name, error);
		}

		navigator.mediaDevices.getUserMedia(constraints)
		.then(handleSuccess)
		.catch(handleError);
	}

	render() {
		return (
			<div>
				Webcam:
				<video ref={this.refVideo} autoPlay style={{display:'none'}} />
			</div>
		);
	}
}

export default Video;
