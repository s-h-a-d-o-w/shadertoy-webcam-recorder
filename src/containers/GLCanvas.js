import React from 'react'

class GLCanvas extends React.Component {
	constructor() {
		super();
		this.refCanvas = React.createRef();
	}

	componentDidMount() {
		const canvas = this.refCanvas.current;
		const gl = canvas.getContext('webgl2');

		// If we don't have a GL context, give up now
		if(!gl) {
			// TODO: Prettier error
			alert('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}
	}

	render() {
		return (
			<div>
				Webcam:
				<canvas ref={this.refCanvas} width={1280} height={720} />
			</div>
		);
	}
}

export default GLCanvas;
