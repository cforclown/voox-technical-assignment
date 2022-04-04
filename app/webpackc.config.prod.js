const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackBundleAnalyzer = require("webpack-bundle-analyzer");

process.env.NODE_ENV = "production";

module.exports = {
    mode: "production",
    target: "web",
    devtool: "source-map",
    entry: "./src/index",
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/",
        filename: "bundle.js",
    },
    plugins: [
        // Display bundle stats
        new webpackBundleAnalyzer.BundleAnalyzerPlugin({ analyzerMode: "static" }),

        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
        }),

        new webpack.DefinePlugin({
            // This global makes sure React is built in prod mode.
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            "process.env.API_URL": JSON.stringify("http://localhost:55555"), // CHANGE THIS TO PRODUCTION API URL
            "process.env.SESSION_TAG": JSON.stringify("/"),
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            favicon: "./src/assets/images/favicon.ico",
            minify: {
                // see https://github.com/kangax/html-minifier#options-quick-reference
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader", "eslint-loader"],
            },
            {
                test: /(\.css|scss)$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000,
                        },
                    },
                ],
            },
        ],
    },
};
