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
		case 'FFMPEG_LOADED':
			return state.set('ffmpegLoaded', action.value);
		case 'IS_RECORDING':
			return state.set('isRecording', action.value);
		case 'IS_PROCESSING':
			return state.set('isProcessing', action.value);
		case 'SHOW_LIGHTBOX':
			return state.set('lightboxContent', action.content);
		case 'HIDE_LIGHTBOX':
			return state.delete('lightboxContent');
		case 'WEBCAM_ACCESS':
			return state.set('webcamAccess', action.value);
		default:
			return state;
	}
};

export default reducer;
