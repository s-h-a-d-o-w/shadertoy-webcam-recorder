const webpack = require('webpack');

// The base for this is webpack.config.js.
// This is merged with it when NODE_ENV is development.
module.exports = {
	mode: 'development',

	entry: {
		app: ['webpack-hot-middleware/client'],
	},
	devServer: {
		contentBase: './dist',
		hot: true
	},
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.EvalSourceMapDevToolPlugin({
			exclude: /ffmpeg/
		}),
	],
};
