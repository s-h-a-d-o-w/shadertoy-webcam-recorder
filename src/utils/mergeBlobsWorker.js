/**
 * This worker will post:
 * - Progress messages in the format of: {type: 'video'|'audio', progress: 0.0-1.0}
 * - When done, an array of streams suitable for ffmpeg's MEMFS input.
 *
 * @param msg
 * @param {Blob[]} msg.data.video
 * @param {Blob[]} msg.data.audio
 */
onmessage = async (msg) => {
	const videoBuffer = arrayBufferConcat(await blobsToArrayBuffers({
		type: 'video',
		blobs: msg.data.video,
	}));

	const audioBuffer = arrayBufferConcat(await blobsToArrayBuffers({
		type: 'audio',
		blobs: msg.data.audio,
	}));

	postMessage([
		{name: "video.webm", data: new Uint8Array(videoBuffer)},
		{name: "audio.webm", data: new Uint8Array(audioBuffer)},
	]);
};

/**
 * @param {Blob} blob
 * @returns {Promise.<ArrayBuffer>}
 */
function blobToArrayBuffer(blob) {
	const fileReader = new FileReader();

	return new Promise((resolve, reject) => {
		fileReader.onload = (e) => resolve(e.target.result);
		fileReader.onerror = reject;

		fileReader.readAsArrayBuffer(blob);
	});
}

/**
 * @param opts
 * @param {string} opts.type 'video' or 'audio'
 * @param {Blob[]} opts.blobs
 * @returns {Promise.<ArrayBuffer[]>}
 */
function blobsToArrayBuffers(opts) {
	const type = opts.type;
	const blobs = opts.blobs;

	let index = 0;
	let progress = 0;
	const buffers = [];

	postMessage({type, progress});
	return new Promise((resolve) => {
		const nextBlobToBuffer = () => {
			if(index < blobs.length) {
				blobToArrayBuffer(blobs[index++]).then((buffer) => {
					buffers.push(buffer);

					progress = index / blobs.length;

					postMessage({type, progress});
					nextBlobToBuffer();
				});
			}
			else
				resolve(buffers);
		};
		nextBlobToBuffer();
	});
}

/**
 * @param {ArrayBuffer[]} buffers
 * @returns {ArrayBuffer}
 */
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
	buffers.forEach(buffer => {
		joined.set(new Uint8Array(buffer), offset);
		offset += buffer.byteLength;
	});

	return joined.buffer;
}
