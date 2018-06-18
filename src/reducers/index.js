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
			return state.set('ffmpegLoaded', true);
		case 'FFMPEG_LOADING_FAILED':
			return state.set('ffmpegLoaded', false);
		case 'START_RECORD':
			return state.set('isRecording', true);
		case 'STOP_RECORD':
			return state.set('isRecording', false);
		default:
			return state;
	}
};

export default reducer;
