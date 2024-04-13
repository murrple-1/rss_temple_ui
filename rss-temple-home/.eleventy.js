const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const fs = require("fs");

const customHtmlDir = process.env.CUSTOM_HTML_DIR;

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

    let f = null;
    try {
      f = fs.openSync(filePath, "r");
      return fs.readFileSync(f, encoding);
    } catch (e) {
      console.error(e);
    } finally {
      if (f !== null) {
        fs.closeSync(f);
      }
    }

    return undefined;
  });
  eleventyConfig.addFilter("customHtml", (file, default_, encoding) => {
    encoding = encoding || "utf8";

    if (customHtmlDir) {
      let f = null;
      try {
        f = fs.openSync(customHtmlDir + "/" + file, "r");
        return fs.readFileSync(f, encoding);
      } catch (e) {
        console.error(e);
      } finally {
        if (f !== null) {
          fs.closeSync(f);
        }
      }
    }

    return default_;
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
