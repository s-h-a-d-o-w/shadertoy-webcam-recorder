import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';

import Stats from './Stats.js';

const StyledDebug = styled.div`
	/*
		Hack to enable clicking of UI elements behind debug container:
		https://stackoverflow.com/questions/1401658/html-overlay-which-allows-clicks-to-fall-through-to-elements-behind-it
	*/
	height: 0;
	overflow: visible;
	pointer-events: none;

	position: absolute;
	top: 0;
	width: 100%;

	display: flex;
	align-items: flex-start;
	justify-content: flex-end;
	text-align: right;

	box-sizing: border-box;
	padding: 2vh;

	/* May not be pretty but it's functional (outlines work well) */
	font-family: sans-serif;
	font-size: 2.5vmin;
	font-weight: bold;
	color: white;

	/* Ensure readability if text overlaps with canvas */
	-webkit-text-stroke: 0.15vmin black;
`;

const Debug = (props) => (
	<StyledDebug>
		<Stats style={{left: '10px'}}/>
		Debug Infos:<br/>
		{
			props.debugInfos &&
			props.debugInfos
			.toJS()
			.reduce( // Add <br> elements between infos
				(acc, el, idx) => acc.concat(el).concat(<br key={idx}/>),
				[]
			)
		}
	</StyledDebug>
);

const mapStateToProps = (state) => {
	console.log('debuginfos: ' + (state.get('debugInfos') && state.get('debugInfos').toJS()));
	return {
		debugInfos: state.get('debugInfos')
	};
};

export default connect(mapStateToProps)(Debug);
