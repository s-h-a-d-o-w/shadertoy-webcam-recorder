import React from 'react';
import styled from 'styled-components';
import {startRecording, stopRecording} from '../actions';
import {connect} from 'react-redux';

const ButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #444;

	width: 18vmin;
	height: 9vmin;

	font-size: 3vmin;
	color: white;

	cursor: pointer;
`;

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
		<ButtonContainer onClick={props.onClickStop}>
			<StopSymbol />STOP
		</ButtonContainer>
	) : (
		<ButtonContainer onClick={props.onClickRecord}>
			<RecordSymbol />REC
		</ButtonContainer>
	)
);


const mapStateToProps = (state) => {
	return {
		isRecording: state.get('isRecording')
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
