/**
 * This worker will post:
 * - Progress messages in the format of: {type: 'video'|'audio', progress: 0.0-1.0}
 * - When done, an array of streams suitable for ffmpeg's MEMFS input.
 *
 * @param msg {video: [Blob], audio: [Blob]}
 */
onmessage = (msg) => {
	blobsToArrayBuffers({
		type: 'video',
		blobs: msg.data.video,
	}).then((videoBuffers) => {
		let videoBuffer = arrayBufferConcat(videoBuffers);
		//console.log('videoBuffer done.');

		blobsToArrayBuffers({
			type: 'audio',
			blobs: msg.data.audio,
		}).then((audioBuffers) => {
			let audioBuffer = arrayBufferConcat(audioBuffers);

			postMessage([
				{name: "video.webm", data: new Uint8Array(videoBuffer)},
				{name: "audio.webm", data: new Uint8Array(audioBuffer)},
			]);
		});
	})
};

function blobsToArrayBuffers(opts) {
	let type = opts.type;
	let blobs = opts.blobs;

	let index = 0;
	let progress = 0;
	const buffers = [];

	postMessage({type, progress});
	return new Promise((resolve, reject) => {
		function nextBlobToBuffer() {
			if(index < blobs.length) {
				blobToArrayBuffer(blobs[index++]).then((e) => {
					buffers.push(e.target.result);

					progress = index / blobs.length;

					postMessage({type, progress});
					nextBlobToBuffer();
				});
			}
			else
				resolve(buffers);
		}
		nextBlobToBuffer();
	});
}

function blobToArrayBuffer(blob) {
	var fileReader = new FileReader();

	return new Promise(function(resolve, reject) {
		fileReader.onload = resolve;
		fileReader.onerror = reject;

		fileReader.readAsArrayBuffer(blob);
	});
};

function arrayBufferConcat(buffers) {
	// Create one array than can contain all buffers
	const joined = new Uint8Array(
		buffers.reduce(
			(acc, buffer) => (acc + buffer.byteLength),
			0
		)
	);

	// Copy all buffers to our single array
	let offset = 0;
	let buffer;
	for(let i in buffers) {
		buffer = buffers[i];
		joined.set(new Uint8Array(buffer), offset);
		offset += buffer.byteLength;
	}

	return joined.buffer;
}


