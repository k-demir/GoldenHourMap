const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    externals: {
        fs: 'empty',
    },
    module: {
        rules: [
            {
                include: [path.join(__dirname)],
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react',
                              '@babel/preset-env'],
                    plugins: [
                        ['@babel/plugin-proposal-class-properties',]
                    ]
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(wasm)$/,
                loader: 'file-loader',
                type: 'javascript/auto',
            },
        ],
    },
    plugins: [new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') }),],
    devServer: {
        inline: true,
        port: 3000
      },
};