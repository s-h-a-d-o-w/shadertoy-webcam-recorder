import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';

import RecordButton from '../components/RecordButton';

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
	border: ${props => props.isRecording ? 0.5 : 0}vh solid red; // Only during recording!
	
	font-family: DSEG14-Classic, sans-serif;
`;

const UI = (props) => (
	<StyledUI {...props}>
		<RecordButton />
	</StyledUI>
);

const mapStateToProps = (state) => {
	return {
		isRecording: state.get('isRecording')
	};
};

export default connect(mapStateToProps)(UI);
