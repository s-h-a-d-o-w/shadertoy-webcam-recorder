const reducer = (state, action) => {
	switch (action.type) {
		case 'START_RECORD':
			return state.set('isRecording', true);
		case 'STOP_RECORD':
			return state.set('isRecording', false);
		default:
			return state;
	}
};

export default reducer;
