const path = require("path");

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const isProd = process.env.__PROD__;
const hash = isProd ? "contenthash:20" : "fullhash";
require("dotenv").config();

module.exports = {
  config: {
    mode: "production",
    target: ["web", "es2020"],
    output: {
      path: path.resolve("dist"),
      filename: `[${hash}].[name].js`,
      publicPath: "",
      chunkFilename: `[${hash}].[name].chunk.js`,
    },
    experiments: {
      topLevelAwait: true,
    },
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
      extensions: [".tsx", ".ts", ".js", ".jsx", ".mjs", ".json"],
    },
    stats: "minimal",
    optimization: {
      minimize: true,
    },
  },
  hash,
  ASSET_PATH: process.env.ASSET_PATH || "",
};
