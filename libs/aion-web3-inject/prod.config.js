const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode:'production',
    entry: {
        contentScript: [path.join(__dirname, 'contentScript')],
    },
    output: {
        path: path.join(__dirname, `./dist`),
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js',
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
        new UglifyJSPlugin({
            uglifyOptions: {
                compress: true
            }}),
         new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production'),
          },
        }),
    ],
    resolve: {
        extensions: ['*', '.js'],
    },
    node: {
        fs: 'empty',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['env','stage-0']
                },
            }
        ]
    }
};
