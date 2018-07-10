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
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.EvalSourceMapDevToolPlugin({
			exclude: /ffmpeg/
		}),
		new webpack.DefinePlugin({
			'PRODUCTION': JSON.stringify(false)
		}),
	]
};

// Remove things from prod config that we don't want in dev
// -----------------------------------------------------------
// Don't use react-lite in dev, as react devtools don't work with it
//Reflect.deleteProperty(config, 'resolve');
// Don't remove console output in dev
Reflect.deleteProperty(configProd, 'optimization');

// Remove PRODUCTION: true flag
configProd.plugins = configProd.plugins.filter(plugin => !(plugin instanceof webpack.DefinePlugin));
// -----------------------------------------------------------

const config = webpackMerge(configProd, configDev);

module.exports = config;
