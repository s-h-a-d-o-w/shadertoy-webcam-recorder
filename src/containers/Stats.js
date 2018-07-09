import React from 'react';
import Stats from 'stats.js';

const stats = new Stats();

class StatsWrapper extends React.Component {
	wrapperRef = React.createRef();

	constructor() {
		super();

		stats.showPanel(0);
		stats.dom.style.left = '10px';
	}

	componentDidMount() {
		this.wrapperRef.current.appendChild(stats.dom);
	}

	render() {
		return <div ref={this.wrapperRef}></div>;
	}
}

export const begin = stats.begin;
export const end = stats.end;
export default StatsWrapper;
