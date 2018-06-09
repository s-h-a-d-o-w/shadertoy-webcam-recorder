// Based on these examples:
// https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample5/webgl-demo.js
// https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html

var video = document.querySelector('video');
var textureUpdateable = false;

var cubeRotation = 0.0;

// Now create an array of positions for the cube.
const positions = [
	// Front face
	-1.0, -1.0, -1.0,
	 1.0, -1.0, -1.0,
	 1.0,  1.0, -1.0,
	-1.0,  1.0, -1.0,
];


main();

//
// Start here
//
function main() {
	const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl2');

	// If we don't have a GL context, give up now
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}

	// Vertex shader program
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;
	
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
	
		varying highp vec2 vTextureCoord;
	
		void main(void) {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vTextureCoord = aTextureCoord;
		}
	`;

	// TODO: insert fragment shaders in the order in which they have to be rendered
	// [0] = main shader
	const fsSources = [`
		void main(void) {
			//gl_FragColor = vec4(vTextureCoord.x, vTextureCoord.y, 0.0, 1.0);
			gl_FragColor = texture2D(iChannel0, vTextureCoord);
	
			//vec4 texel = texture2D(iChannel0, vTextureCoord);
			//gl_FragColor = vec4(1.0 - texel.x, 1.0 - texel.y, 1.0 - texel.z, 1.0);
	
			//gl_FragColor = texture2D(iChannel1, vTextureCoord);
		}
		`,`
		void main(void) {
			//gl_FragColor = vec4(vTextureCoord.x, vTextureCoord.y, 0.0, 1.0);
	
			//vec4 texel = texture2D(iChannel0, vTextureCoord);
			//gl_FragColor = vec4(1.0 - texel.x, 1.0 - texel.y, 1.0 - texel.z, 1.0);
			
			gl_FragColor = texture2D(iChannel0, vTextureCoord);
		}
	`];

	const numInputs = [1, 1];

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const programInfos = initShaderPrograms(gl, {
		vsSource,
		fsSources,
		numInputs
	});


	// GL INITIALIZTIONS
	// ==============================================
	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	const buffers = initBuffers(gl);

	const texWebcam = connectWebcam(gl);
	//const texture = loadTexture(gl, '720p.jpg');
	// ==============================================


	let done = false;
	video.addEventListener('playing', function() {
		// Listener is trigger twice in quick succession - too quick
		// for removeEventListener to finish in time.
		// But this should only be executed once.
		if(done) return;
		done = true;

		console.log('Stream starts playing.');

		// Create textures for framebuffers
		const targetTextureWidth = 1280; // TODO: probably change to video.videoWidth or something
		const targetTextureHeight = 720;
		const fbTextures = [];
		const framebuffers = [];

		for(let i = 0; i < fsSources.length - 1; i++) {
			// TODO: All of this should probably be some "Buffer" class where each has an input texture,
			// processes it, outputs it into framebuffer and then finally hands it off as output texture.

			fbTextures[i] = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, fbTextures[i]);

			// define size and format of level 0
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			const data = null;
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
							targetTextureWidth, targetTextureHeight, border,
							format, type, data);

			// set the filtering so we don't need mips
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			// Create and bind the framebuffer
			framebuffers[i] = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i]);

			// attach the texture as the first color attachment
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTextures[i], level);
		}


		textureUpdateable = true;

		var stats = new Stats();
		stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		stats.domElement.style.left = '10px';
		document.body.appendChild(stats.dom);


		var texTemp = loadTexture(gl, '720p-testpattern.png');

		// Draw the scene repeatedly
		function render(now) {
			stats.begin();

			// Fixed texture: 59 FPS
			// Just streaming stuff from webcam without processing: Chrome 30 FPS, FF 30 FPS
			drawScene(gl, programInfos, buffers, framebuffers, fbTextures, texWebcam, texTemp);

			// request animation frame in updateTexture, since we don't need to render unless there's a new frame
			// from the webcam!
			if(textureUpdateable)
				updateTexture(gl, texWebcam, video, render);
			else
				// need to stupidly loop this until webcam stream becomes available
				requestAnimationFrame(render);

			stats.end();
			//requestAnimationFrame(render);
		}
		requestAnimationFrame(render);
	}, true);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Now set up the texture coordinates for the faces.

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	const textureCoordinates = [
		// Front
		0.0,	0.0,
		1.0,	0.0,
		1.0,	1.0,
		0.0,	1.0,
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
				gl.STATIC_DRAW);

	// Build the element array buffer; this specifies the indices
	// into the vertex arrays for each face's vertices.

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	const indices = [
		0, 1, 2, 0, 2, 3, // front
	];

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices), gl.STATIC_DRAW);

	return {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	};
}

function updateTexture(gl, texture, updateSource, callback) {
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	//const t1 = performance.now();
	// Texture upload takes ridiculously long on Chrome, probably will never be fixed:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=91208#c114
	// On Firefox 0-2ms.
	// TODO: Suggest Firefox to people using Chrome?
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
		gl.RGBA, gl.UNSIGNED_BYTE, updateSource);
	//const t2 = performance.now();
	//console.log(t2-t1 + " ms");
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // TODO: Don't forget to do this with all textures after loading

	requestAnimationFrame(callback);
}

// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	//gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);	// opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				width, height, border, srcFormat, srcType,
				pixel);

	const image = new Image();
	image.onload = function() {
		//gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
						srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

/**
 * Initializes webcam, gets mediastream
 *
 * @returns texture
 */
function connectWebcam(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 0, 255]);	// opaque black
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				width, height, border, srcFormat, srcType,
				pixel);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


	// Put variables in global scope to make them available to the browser console.
	var constraints = window.constraints = {
		audio: false,
		video: { width: {exact: 1280}, height: {exact: 720} }
	};

	function handleSuccess(stream) {
		var videoTracks = stream.getVideoTracks();
		console.log('Got stream with constraints:', constraints);
		console.log('Using video device: ' + videoTracks[0].label);
		stream.oninactive = () => console.log('Stream inactive');
		window.stream = stream; // make variable available to browser console
		video.srcObject = stream;
	}

	function handleError(error) {
		if (error.name === 'ConstraintNotSatisfiedError') {
			console.error('The resolution ' + constraints.video.width.exact + 'x' +
				constraints.video.width.exact + ' px is not supported by your device.');
		} else if (error.name === 'PermissionDeniedError') {
			console.error('Permissions have not been granted to use your camera and ' +
			'microphone, you need to allow the page access to your devices in ' +
			'order for the demo to work.');
		}
		console.error('getUserMedia error: ' + error.name, error);
	}

	navigator.mediaDevices.getUserMedia(constraints)
	.then(handleSuccess).catch(handleError);

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

//
// Draw the scene.
//
function drawScene(gl, programInfos, buffers, framebuffers, fbTextures, texWebcam, texTemp) {
	// RENDER "buffer 1"

	// render to our targetTexture by binding the framebuffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfos[1].program);

	// BIND WEBCAM TEXTURE
	gl.uniform1i(programInfos[1].uniformLocations.iChannel0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texWebcam);

	drawPlane(gl, programInfos[1], buffers);


	// RENDER "main buffer"

	// render to canvas by binding null
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfos[0].program);

	// BIND TEXTURE OF PREVIOUS FRAMEBUFFER
	gl.uniform1i(programInfos[0].uniformLocations.iChannel0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbTextures[0]);

	drawPlane(gl, programInfos[0], buffers);
}

function drawPlane(gl, programInfo, buffers) {
	// GENERAL DRAWING STUFF - GEOMETRY, MATRICES
	// -----------------------------------------------
	const projectionMatrix = mat4.create();

	// (static) ortho(out, left, right, bottom, top, near, far) → {mat4}
	mat4.ortho(projectionMatrix, -1, 1, -1, 1, 0.1, 100);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();

	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix
	);

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute
	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}

	// Tell WebGL how to pull out the texture coordinates from
	// the texture coordinate buffer into the textureCoord attribute.
	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}

	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	{
		const vertexCount = 6; // number of vertices to be used for drawing!
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}


/**
 * Initializes shader programs.
 * Receives object containing vertex shader code and multiple fragment shader code fragments
 *
 * @param {GLContext} gl
 * @param {Object} opts {vsSource, Array fsSources, Array numInputs}
 */
function initShaderPrograms(gl, opts) {
	function boilerplate(numInputs) {
		return `
			precision mediump float;
			varying highp vec2 vTextureCoord;
			
		` +
		(new Array(numInputs))
		.fill()
		//.map((elem, idx) => `uniform sampler2D iChannel${idx};`)
		.map((elem, idx) => `uniform sampler2D iChannel${idx};`)
		.join('\n');
	}

	// prepend boilerplate to all shaders
	const fsSources = opts.fsSources.map((elem, idx) => boilerplate(opts.numInputs[idx]) + elem);


	const shaderProgramInfos = [];

	fsSources.forEach((fsSource, i) => {
		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, opts.vsSource);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

		// Create the shader program
		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		// If creating the shader program failed, alert
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
			return null;
		}

		const shaderProgramInfo = {
			program: shaderProgram,
			attribLocations: {
				vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
				textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
			},
			uniformLocations: {
				projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
				modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			}
		};

		// add iChannels
		for(let i = 0; i < opts.numInputs[i]; i++)
			shaderProgramInfo['iChannel' + i] = gl.getUniformLocation(shaderProgram, 'iChannel' + i);

		shaderProgramInfos.push(shaderProgramInfo);
	});

	console.log(JSON.stringify(shaderProgramInfos));

	return shaderProgramInfos;
}




//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object
	gl.shaderSource(shader, source);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

