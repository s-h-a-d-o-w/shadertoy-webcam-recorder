import React from 'react';
import {hot} from 'react-hot-loader';
import UI from '../containers/UI.js';
import Webcam from '../containers/Webcam.js';

const App = () => (
	<div>
		<Webcam/>
		<UI/>
	</div>
);

export default hot(module)(App);
