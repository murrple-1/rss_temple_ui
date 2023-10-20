const path = require("path");

module.exports = {
  entry: "./scripts/main.js",
  output: {
    path: path.resolve(__dirname, "_site", "scripts"),
    filename: "main.min.js",
    publicPath: "/scripts/"
  },
  mode: "production"
};
