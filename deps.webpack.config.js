let webpack = require('webpack');

module.exports = {
	entry: './deps.js',

	output: {
		path: __dirname + '/dist',
		filename: 'geodesy.js',
		libraryTarget: 'var',
		library: 'FrontSpotGeodesy'
	},
	
	module: {
		loaders: [
			{test: /\.js$/,
			 exclude: /(node_modules)/,
			 loader: 'babel-loader',
			 query: {
				 presets: ['es2015']
			 }}
		]
	},
	
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	]
};

if (true || process.env.LOCAL) {
	module.exports.plugins = [];
}
