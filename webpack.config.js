const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

console.log(__dirname);

module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    output: {
        path: path.join(__dirname, 'build/public'),
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'build/public'),
        historyApiFallback: true
    },
    plugins: [
        new CopyPlugin([
            { from: 'public', to: '.' },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    devtool: 'eval-source-map'
};