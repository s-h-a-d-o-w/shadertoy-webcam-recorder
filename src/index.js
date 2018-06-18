import React from 'react';
import {render} from 'react-dom';
import Immutable from "immutable";
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';

import App from './components/App.js';
import rootReducer from './reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
	rootReducer,
	Immutable.Map(),
	composeEnhancers(applyMiddleware(thunk))
);

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);
