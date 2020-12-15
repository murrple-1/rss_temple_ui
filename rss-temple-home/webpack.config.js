const path = require("path");

module.exports = {
  entry: "./src/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "dist", "scripts"),
    filename: "main.min.js",
    publicPath: "/scripts/"
  },
  mode: "production"
};
