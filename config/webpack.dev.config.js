const {merge} = require('webpack-merge');
const common = require('../webpack.common.config');

const config = {
    mode: "development",
    devtool: "cheap-module-source-map",
    module: {
        rules: [
            // SASS/CSS files
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: 'style-loader'
                    }, // Loads css into page (Extract CSS in production)
                    {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                    },
                    {
                        loader: 'sass-loader' // compiles Sass to CSS
                    }]
            },
        ]
    }
};

module.exports = merge(common, config);