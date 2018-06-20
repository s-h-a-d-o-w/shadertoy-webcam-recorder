import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';

import RecordButton from '../components/RecordButton';
import Button from '../components/Button';

const StyledUI = styled.div`
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;

	display: flex;
	align-items: flex-end;
	justify-content: center;

	box-sizing: border-box;
	padding: 5vh;
	border: ${props => props.isRecording ? 0.5 : 0}vh solid red;

	font-family: DSEG14-Classic, sans-serif;
	color: white;
`;

const UI = (props) => (
	<StyledUI {...props}>
	{
		props.ffmpegLoaded === undefined ? (
			<Button>LOADING</Button>
		) : (
			props.ffmpegLoaded ? (
				props.isProcessing ? (
					//<Button>PROCESSING</Button>
					<Button>{props.progress}</Button>
				) : (
					<RecordButton />
				)
			) : (
				<Button>RECORDING UNAVAILABLE</Button>
			)
		)
	}
	</StyledUI>
);

const mapStateToProps = (state) => {
	return {
		ffmpegLoaded: state.get('ffmpegLoaded'),
		isProcessing: state.get('isProcessing'),
		isRecording: state.get('isRecording'), // used in styling
		progress: state.get('progress'),
	};
};

export default connect(mapStateToProps)(UI);
