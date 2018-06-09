import React from 'react';
import {hot} from 'react-hot-loader';
import UI from '../containers/UI.js';
import Video from '../containers/Video.js';
import GLCanvas from '../containers/GLCanvas.js';

const App = () => (
	<div>
		<Video/>
		<GLCanvas/>
		<UI/>
	</div>
);

export default hot(module)(App);
