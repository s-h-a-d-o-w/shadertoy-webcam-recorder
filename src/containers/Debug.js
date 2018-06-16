import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';

import RecordButton from '../components/RecordButton';

const StyledDebug = styled.div`
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;

	display: flex;
	align-items: flex-start;
	justify-content: flex-end;
	text-align: right;

	box-sizing: border-box;
	padding: 2vh;

	font-family: sans-serif;
	font-size: 2.5vmin;
	font-weight: bold;
	color: white;

	/* Ensure readability if text overlaps with canvas */
	-webkit-text-stroke: 0.15vmin black;
`;

const Debug = (props) => (
	<StyledDebug>
		Debug Infos:<br/>
		{props.debugInfos && props.debugInfos.toJS()}
	</StyledDebug>
);

const mapStateToProps = (state) => {
	console.log('debuginfos: ' + (state.get('debugInfos') && state.get('debugInfos').toJS()));
	return {
		debugInfos: state.get('debugInfos')
	};
};

export default connect(mapStateToProps)(Debug);