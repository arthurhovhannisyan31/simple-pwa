const path = require("path");

const { DefinePlugin } = require("webpack");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.config");

module.exports = merge(common.config, {
  mode: "production",
  target: ["web", "es2020"],
  entry: {
    "service-worker": {
      import: path.resolve("src", "service-workers", "main-sw.ts"),
      filename: "service-worker.js",
    },
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)?$/,
        use: "babel-loader",
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
        generator: {
          filename: `static/[${common.hash}].[name][ext]`,
        },
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      "process.env.ASSET_PATH": JSON.stringify(common.ASSET_PATH),
    }),
  ],
});
