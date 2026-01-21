import path from "path";
import { fileURLToPath } from 'url';
import nodeExternals from "webpack-node-externals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './server2.js', // Your main backend file
    target: 'node',       // Important: tells Webpack it's for Node.js
    externals: [nodeExternals()], // Skip bundling node_modules
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
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
