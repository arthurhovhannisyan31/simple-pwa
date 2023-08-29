/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const prod = require("./webpack.prod.config");

module.exports = merge(prod, {
  target: "web",
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    "service-worker": {
      import: path.resolve("src", "service-workers", "main-sw.ts"),
      filename: "service-worker.js",
    },
  },
  devServer: {
    allowedHosts: "all",
    historyApiFallback: true,
    host: process.env.HOST,
    server: {
      type: "http",
    },
    http2: true,
    port: process.env.PORT || 4000,
    static: {
      directory: path.join(__dirname, "dist"),
      watch: {
        interval: 1000,
        ignored: ["**/node_modules"],
        usePolling: true,
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
