const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const configProd = require('./webpack.config.js');
const configDev = {
	mode: 'development',

	devServer: {
		contentBase: './dist',
		hot: true,
		port: 3000,
		stats: {
			modules: false,
		}
	},
	entry: {
		app: ['webpack-hot-middleware/client'],
	},
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.EvalSourceMapDevToolPlugin({
			exclude: /ffmpeg/
		}),
	]
}

const config = webpackMerge(configProd, configDev);

// Don't use react-lite in dev, as react devtools don't work with it
//Reflect.deleteProperty(config, 'resolve');
// Don't remove console output in dev
Reflect.deleteProperty(config, 'optimization');

module.exports = config;
