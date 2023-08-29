const path = require("path");

const { merge } = require("webpack-merge");

const common = require("./webpack.common.config");

module.exports = merge(common.config, {
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
});
