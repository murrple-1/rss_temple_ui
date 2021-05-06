"use strict";

var fs = require("fs");

module.exports.register = function (Handlebars, options, params) {
  Handlebars.registerHelper("include", function (filePath, encoding) {
    encoding = encoding || "utf8";
    var data = fs.readFileSync(filePath, encoding);
    return new Handlebars.SafeString(data);
  });
};
