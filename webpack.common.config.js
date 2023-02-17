const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const SRC = path.resolve(__dirname, "src");
const OUTPUT = path.resolve(__dirname, "dist");

// Webpack Configuration File
const config = {
    mode: "development",
    devtool: "inline-source-map",
    entry: SRC + "/index.js",
    target: 'electron-renderer',
    output: {
        path: OUTPUT,
        filename: "[name].js",
        chunkFilename: '[name].[id].[chunkhash].js',
        clean: true
    },
    module: {
        rules: [
            // All '.js' files will be handled by 'babel-loader'
            {
                test: /\.js$/,
                include: SRC,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader"
                }
            },
            // SASS/CSS files
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    // Creates style nodes from JS strings
                    {
                        loader: 'style-loader'
                    },
                    // translates CSS into CommonJS modules
                    {
                        loader: 'css-loader'
                    },
                    // compiles Sass to CSS
                    {
                        loader: 'sass-loader'
                    }]
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: SRC + '/index.html'
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    }
};

module.exports = config;