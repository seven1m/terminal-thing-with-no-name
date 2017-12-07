'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'termy': path.resolve('./termy.js')
    },

    output: {
        filename: '[name].js',
        path: path.resolve('./public/js')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },

    plugins: [
      new CopyWebpackPlugin([
        { from: 'node_modules/xterm/dist/xterm.css' },
        { from: 'node_modules/xterm/dist/xterm.js' },
        { from: 'node_modules/xterm/dist/addons/fit/fit.js',
          to: path.resolve('./public/js/addons/fit/fit.js') },
        { from: 'node_modules/browserfs/dist/browserfs.js' },
        { from: 'js/vendor/rope.js',
          to: path.resolve('./public/js/rope.js') },
        { from: 'js/bin/*',
          to: path.resolve('./public/js/bin/[name].[ext]') }
      ])
    ]
};
