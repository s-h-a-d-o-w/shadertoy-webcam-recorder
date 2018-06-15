const express = require('express');
const app = express();

const port = process.env.PORT || 3000
const isDev = !(process.env.NODE_ENV === 'production');

if(isDev) {
	const webpack = require('webpack');
	const webpackMerge = require('webpack-merge');
	const webpackDevMiddleware = require('webpack-dev-middleware');

	const configProd = require('./webpack.config.js');
	const configDev = require('./webpack.config.dev.js');
	const config = webpackMerge(configProd, configDev);

	// Don't use react-lite in dev, as react devtools don't work with it
	//Reflect.deleteProperty(config, 'resolve');
	// Don't remove console output in dev
	Reflect.deleteProperty(config, 'optimization');

	const compiler = webpack(config);

	// Tell express to use the webpack-dev-middleware and use the
	// merged webpack configs as a base.
	app.use(webpackDevMiddleware(compiler, {
		publicPath: config.output.publicPath,
		stats: {
			// Older versions of electron produce garbled output because of formatting in Windows.
			// (Newer versions seem to strip formatting from the get go)
			// https://github.com/electron/electron/issues/11488
			colors: true,
			modules: false, // Hide log output about all successfully built modules
		},
	}));
	app.use(require("webpack-hot-middleware")(compiler));
}
else {
	console.log('Using production bundle');
	app.use(express.static(__dirname + '/dist'));
}

app.listen(port, function () {
	console.log(`Listening on port ${port}!\n`);
});
