'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve('./termy.js')
    },

    output: {
        filename: 'termy.js',
        path: path.resolve('./public/dist')
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
          to: path.resolve('./public/dist/addons/fit/fit.js') },
        { from: 'node_modules/browserfs/dist/browserfs.js' }
      ])
    ]
};
