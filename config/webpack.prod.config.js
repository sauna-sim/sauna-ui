const {merge} = require('webpack-merge');
const common = require('../webpack.common.config');

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    mode: "production",
    module: {
        rules: [
            // SASS/CSS files
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, // Loads css into page (Extract CSS in production)
                    {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                    },
                    {
                        loader: 'sass-loader' // compiles Sass to CSS
                    }]
            },
        ]
    },
    optimization: {
        // Minify for Production
        minimize: true,
        minimizer: [
            "...",
            new CssMinimizerPlugin()
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'assets/css/[name].[hash].css',
            chunkFilename: 'assets/css/[id].[hash].css',
        })
    ],
};

module.exports = merge(common, config);