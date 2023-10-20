const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const fs = require("fs");
const headCustomDir = process.env.HEAD_CUSTOM_DIR;

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("media/");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "/robots.txt" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-*":
      "media/fonts/",
    "node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-*":
      "media/fonts/"
  });

  eleventyConfig.setTemplateFormats(["liquid"]);

  eleventyConfig.addFilter("include", (filePath, encoding) => {
    encoding = encoding || "utf8";
    return fs.readFileSync(filePath, encoding);
  });
  eleventyConfig.addFilter("headCustom", (file, encoding) => {
    if (headCustomDir) {
      encoding = encoding || "utf8";
      try {
        return fs.readFileSync(headCustomDir + "/" + file, encoding);
      } catch (e) {
        console.error(e);
      }
    }

    return undefined;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    }
  };
};
