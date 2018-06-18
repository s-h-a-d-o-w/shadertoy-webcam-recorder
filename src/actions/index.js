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

export const startRecording = () => ({
	type: 'START_RECORD',
});

export const stopRecording = () => ({
	type: 'STOP_RECORD',
});
