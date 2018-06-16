import * as Recorder from '../utils/Recorder.js';
import Immutable from 'immutable';

const reducer = (state, action) => {
	switch (action.type) {
		case 'ADD_DEBUG_INFO':
			return state.set(
				'debugInfos',
				state.get(
					'debugInfos',
					Immutable.List()
				).push(action.info)
			);
		case 'START_RECORD':
			Recorder.startRecording();
			return state.set('isRecording', true);
		case 'STOP_RECORD':
			// TODO: UI indication that recording is being processed...

			// Temp test download
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
			})
			.catch(e => console.error(e));

			return state.set('isRecording', false);
		default:
			return state;
	}
};

export default reducer;
