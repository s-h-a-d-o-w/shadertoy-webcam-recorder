const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
	mode: 'production',

	resolve: {
		alias: {
			'react': 'react-lite',
			'react-dom': 'react-lite'
		},
	},

	// Each entry has an array assigned so that webpack-hot-middleware can be merged into it in dev.
	// See: https://github.com/webpack-contrib/webpack-hot-middleware#use-with-multiple-entry-points-in-webpack
	// Also e.g.: https://github.com/webpack-contrib/webpack-hot-middleware/issues/197
	entry: {
		app: ['./src/index.js'],
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		// Copy necessary files that won't be in the .js bundle
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, 'src/index.html'),
			to: path.resolve(__dirname, 'dist/index.html'),
		}]),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	module: {
		rules: [{
			test: /\.(js|jsx)$/,
			exclude: /node_modules/,
			use: [
				'babel-loader',
			],
		}, {
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}, {
			// See: https://survivejs.com/webpack/loading/fonts/
			// Match woff2 in addition to patterns like .woff?v=1.1.1.
			test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
			use: {
				loader: "url-loader",
				options: {
					// Limit at 50k. Above that it emits separate files
					limit: 50000,

					// url-loader sets mimetype if it's passed.
					// Without this it derives it from the file extension
					mimetype: "application/font-woff",

					// Output below fonts directory
					name: "./fonts/[name].[ext]",
				}
			}
		}, {
			test: /\.(ttf|eot)$/,
			use: {
				loader: "url-loader",
				options: {
					limit: 50000,
				},
			},
		}],
	},
};

if(process.env.BUNDLE_ANALYZER)
	config.plugins.push(new BundleAnalyzerPlugin());

module.exports = config;
