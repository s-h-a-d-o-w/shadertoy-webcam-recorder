import React from 'react';
import {hot} from 'react-hot-loader';
import styled from 'styled-components';
import {connect} from 'react-redux';

import UI from '../containers/UI.js';
import Webcam from '../containers/Webcam.js';
import Debug from '../containers/Debug.js';
import Lightbox from './Lightbox.js';

import DSEG14woff from '../../assets/DSEG14Classic-Regular.woff';
import MontserratLight from '../../assets/Montserrat-Light.woff';

const StyledApp = styled.div`
	@font-face {
		font-family: DSEG14-Classic;
		/* Since fonts are inlined and .woff has 95% support, might as well only use supply that one */
		src: url(${DSEG14woff}) format('woff');
	}
	@font-face {
		font-family: Montserrat;
		src: url(${MontserratLight}) format('woff');
	}

	position:absolute;
	margin: 0;
	width: 100%;
	height: 100%;
	background-color: dimgray;

	font-family: Montserrat, sans-serif;
	font-size: 3vmin;
	color: white;
`;

const App = (props) => (
	<StyledApp>
		<Webcam/>
		{
			props.webcamAccess ?
				<UI/> : ''
		}
		<Debug/>
		{/* TODO: Uncomment this once the app is ready for release
		!PRODUCTION ? <Debug/> : ''*/}
		{
			props.lightboxContent ?
				<Lightbox>{props.lightboxContent}</Lightbox> : ''
		}
	</StyledApp>
);

const mapStateToProps = (state) => {
	return {
		lightboxContent: state.get('lightboxContent'),
		webcamAccess: state.get('webcamAccess'),
	};
};

export default hot(module)(connect(mapStateToProps)(App));
