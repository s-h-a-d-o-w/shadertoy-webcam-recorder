import * as Recorder from '../utils/Recorder.js';

const reducer = (state, action) => {
	switch (action.type) {
		case 'START_RECORD':
			Recorder.startRecording();
			return state.set('isRecording', true);
		case 'STOP_RECORD':
			Recorder.stopRecording();

			// Temp test download
			var url = Recorder.getObjectURL();
			var a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'test.webm';
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 100);

			return state.set('isRecording', false);
		default:
			return state;
	}
};

export default reducer;
