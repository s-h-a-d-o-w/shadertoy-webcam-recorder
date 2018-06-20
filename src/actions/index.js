import * as Recorder from '../utils/Recorder.js';

export const addDebugInfo = (info) => ({
	type: 'ADD_DEBUG_INFO',
	info,
});

export const ffmpegLoaded = (value) => ({
	type: 'FFMPEG_LOADED',
	value,
});

export const progress = (value) => ({
	type: 'PROGRESS',
	value
});

export const hideLightbox = () => ({
	type: 'HIDE_LIGHTBOX',
});

export const showLightbox = (content) => ({
	type: 'SHOW_LIGHTBOX',
	content,
});

export const startRecording = () => {
	Recorder.startRecording();

	return {
		type: 'IS_RECORDING',
		value: true
	}
};

export const stopRecording = () => {
	return (dispatch) => {
		dispatch({
			type: 'IS_RECORDING',
			value: false,
		});
		dispatch({
			type: 'IS_PROCESSING',
			value: true,
		});

		Recorder.stopRecording()
		.then(() => Recorder.getObjectURL(dispatch))
		.then((url) => {
			let a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'output.webm';
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
				a = null;
			}, 100);

			// It takes a bit for the browser to pop up download prompt
			setTimeout(() => dispatch({
					type: 'IS_PROCESSING',
					value: false,
			}), 500);
		})
		.catch(e => console.error(e)); // TODO: Provide feedback to user
	}
};

export const webcamAccess = (value) => ({
	type: 'WEBCAM_ACCESS',
	value,
});
