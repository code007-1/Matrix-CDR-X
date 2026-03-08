const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: {
        main: './server2.js',
        save_service: './services/save_service_entry.js'
    },
    target: 'node',       // Important: tells Webpack it's for Node.js
    externals: [nodeExternals()], // Skip bundling node_modules
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: (pathData) => {
            return pathData.chunk.name === 'main' ? '[name].bundle.cjs' : '[name].bundle.js';
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Optional: if using ES6+
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
