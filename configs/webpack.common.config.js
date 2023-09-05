const path = require("path");

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const hash = "contenthash:20";

require("dotenv").config();

module.exports = {
  config: {
    mode: "production",
    target: ["web", "es2020"],
    output: {
      path: path.resolve("dist"),
      filename: `[${hash}].[name].js`,
      publicPath: process.env.ASSET_PATH,
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
};
