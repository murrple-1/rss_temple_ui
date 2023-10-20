const path = require("path");

module.exports = {
  entry: "./scripts/main.js",
  output: {
    path: path.resolve(__dirname, "_site", "scripts"),
    filename: "main.min.js",
    publicPath: "/scripts/"
  },
  cache: false, // TODO disabled until server has more memory...uses in-memory cache by default
  mode: "production"
};
