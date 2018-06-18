import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';

import Button from './Button';
import {startRecording, stopRecording} from '../actions';

const RecordSymbol = styled.div`
	display: inline-block;
	background-color: red;

	width: 4vmin;
	height: 4vmin;
	border-radius: 50%;
	margin-right: 1.2vmin;

	border: #444 4px solid;
	box-shadow: 0 0 0 2px #fff;
`;

const StopSymbol = styled.div`
	display: inline-block;
	background-color: black;

	width: 3vmin;
	height: 3vmin;
	margin-right: 1.2vmin;

	border: #444 4px solid;
	box-shadow: 0 0 0 2px #fff;
`;


const RecordButton = (props) => (
	props.isRecording ? (
		<Button onClick={props.onClickStop}>
			<StopSymbol />STOP
		</Button>
	) : (
		<Button onClick={props.onClickRecord}>
			<RecordSymbol />REC
		</Button>
	)
);


const mapStateToProps = (state) => {
	return {
		isRecording: state.get('isRecording'),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onClickRecord: () => {
			dispatch(startRecording());
		},
		onClickStop: () => {
			dispatch(stopRecording());
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(RecordButton);
