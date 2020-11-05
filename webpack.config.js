'use strict';

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
let externals = _externals();
const path = require('path');
module.exports = {
    devtool: "source-map",
    optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
        }
      }),
    ],
  },
    entry: {
        app: './app.js',
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: ['.css','.js']
    },
    externals: externals,
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __filename: true,
        __dirname: true,
        setImmediate: true
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015','stage-0']
                }
            }
        ]
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin()
    // ]
};

function _externals() {
    let manifest = require('./package.json');
    let dependencies = manifest.dependencies;
    let externals = {};
    for (let p in dependencies) {
        externals[p] = 'commonjs ' + p;
    }
    return externals;
}