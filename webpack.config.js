const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./build/src/index.js",
  target: "node",
  mode: "development",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
  devtool: "nosources-source-map",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
    sourceMapFilename: "[file].map",
  },
};
