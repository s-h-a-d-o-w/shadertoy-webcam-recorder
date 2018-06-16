export const addDebugInfo = (info) => ({
	type: 'ADD_DEBUG_INFO',
	info
});

export const startRecording = () => ({
	type: 'START_RECORD'
});

export const stopRecording = () => ({
	type: 'STOP_RECORD'
});
