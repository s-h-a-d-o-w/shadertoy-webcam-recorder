import * as Recorder from '../utils/Recorder.js';

export const addDebugInfo = (info) => ({
	type: 'ADD_DEBUG_INFO',
	info,
});

export const ffmpegLoaded = () => ({
	type: 'FFMPEG_LOADED',
});

export const ffmpegLoadingFailed = () => ({
	type: 'FFMPEG_LOADING_FAILED',
});

export const startRecording = () => {
	Recorder.startRecording();

	return {
		type: 'BEGIN_RECORD',
	}
};

export const stopRecording = () => {
	return (dispatch) => {
		dispatch({
			type: 'END_RECORD',
		});
		dispatch({
			type: 'BEGIN_PROCESSING',
		});

		Recorder.stopRecording()
		.then(Recorder.getObjectURL)
		.then((url) => {
			var a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'output.webm';
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 100);

			// It takes a bit for the browser to pop up download prompt
			setTimeout(() => dispatch({
					type: 'END_PROCESSING',
			}), 500);
		})
		.catch(e => console.error(e)); // TODO: Provide feedback to user
	}
};
