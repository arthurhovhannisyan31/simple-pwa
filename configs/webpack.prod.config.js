const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin } = require("webpack");
const WebpackAssetsManifest = require("webpack-assets-manifest");
const { merge } = require("webpack-merge");
const WebpackPwaManifest = require("webpack-pwa-manifest");

const manifest = require("./manifest.json");
const common = require("./webpack.common.config");

console.log(common.ASSET_PATH);

module.exports = merge(common.config, {
  entry: {
    app: path.resolve("src", "index.ts"),
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)?$/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
        generator: {
          filename: `static/[${common.hash}].[name][ext]`,
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: { outputPath: "public" },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      "process.env.ASSET_PATH": JSON.stringify(common.ASSET_PATH),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve("public", "index.html"),
      cache: false,
      favicon: path.resolve("src/static/img", "favicon.ico"),
    }),
    new MiniCssExtractPlugin({
      filename: `[${common.hash}].[name].css`,
    }),
    new WebpackAssetsManifest({
      enabled: !!process.env.__PROD__,
      customize(entry) {
        if (entry.key.match(/(service-worker|assets-manifest|index.html|LICENSE)/gm)) {
          return false;
        }

        if (common !== "/") {
          return {
            key: entry.key,
            value: `${common.ASSET_PATH}${entry.value}`,
          };
        }

        return entry;
      },
      async done(manifest) {
        await manifest.writeTo("assets/assets-manifest.json");
      },
    }),
    new WebpackPwaManifest({
      ...manifest,
      publicPath: common.ASSET_PATH,
    }),
  ],
});
