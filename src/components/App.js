import React from 'react';
import {hot} from 'react-hot-loader';
import styled from 'styled-components';

import DSEG14woff from '../../assets/DSEG14Classic-Regular.woff';
import UI from '../containers/UI.js';
import Webcam from '../containers/Webcam.js';

const StyledApp = styled.div`
	@font-face {
		font-family: 'DSEG14-Classic';
		/* Since fonts are inlined and .woff has 95% support, might as well only use supply that one */
		src: url('${DSEG14woff}') format('woff');
		font-weight: normal;
		font-style: normal;
	}

	position:absolute;
	margin: 0;
	width: 100%;
	height: 100%;
	background-color: dimgray;
`;

const App = () => (
	<StyledApp>
		<Webcam/>
		<UI/>
	</StyledApp>
);

export default hot(module)(App);
