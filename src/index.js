import React from 'react';
import {render} from 'react-dom';
import Immutable from "immutable";
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import App from './components/App.js';
import rootReducer from './reducers'

const store = createStore(
	rootReducer,
	Immutable.Map(),
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);
