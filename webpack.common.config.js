const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const SRC = path.resolve(__dirname, "src");
const OUTPUT = path.resolve(__dirname, "dist");

// Webpack Configuration File
const config = {
    entry: SRC + "/index.js",
    output: {
        path: OUTPUT,
        filename: "[name].js",
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
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            // CSS/SASS files are dependent on build env. Check dev/qa/prod files
            // Extract Font files
            {
                test: /\.(ttf|eot|woff|woff2|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "assets/fonts/",
                            esModule: false
                        }
                    }
                ]
            },
            // Extract Image files
            {
                test: /\.(jpe?g|png|gif|svg)(?:\?.*|)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            hash: "sha512",
                            digest: "hex",
                            name: "[name].[ext]",
                            outputPath: "assets/images/",
                            esModule: false
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        }),
        new HtmlWebpackPlugin({
            template: SRC + '/index.html'
        }),
        // Copies static files to dist folder
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: SRC + '/static',
                    to: OUTPUT,
                    globOptions: {
                        ignore: ['.DS_Store']
                    }
                }
            ]
        })
    ],
    devServer: {
        static: {
            directory: OUTPUT
        },
        port: 5003,
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js', '.json']
    }
};

module.exports = config;