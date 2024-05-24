const fs = require("fs");
const path = require("path");

const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const esbuild = require("esbuild");
const sass = require("sass");

const customHtmlDir = process.env.CUSTOM_HTML_DIR;
const generateSourceMaps = process.env.GENERATE_SOURCE_MAPS === "true";

module.exports = function (eleventyConfig) {
  eleventyConfig.addTemplateFormats(["scss", "js"]);

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addExtension("scss", {
    outputFileExtension: "min.css",

    compile: async (inputContent) => {
      const results = sass.compileString(inputContent, {
        style: "compressed",
        loadPaths: ["node_modules"]
      });
      return () => {
        return results.css;
      };
    }
  });
  eleventyConfig.addExtension("js", {
    outputFileExtension: "min.js",
    compile: async (_inputContent, inputPath) => {
      if (inputPath.endsWith(".11tydata.js")) {
        return;
      }

      esbuild.buildSync({
        entryPoints: [inputPath],
        entryNames: "[dir]/[name]",
        bundle: true,
        outdir: "_site/scripts/",
        splitting: true,
        chunkNames: "[name]-[hash]",
        minify: true,
        format: "esm",
        sourcemap: generateSourceMaps,
        outExtension: {
          ".js": ".min.js"
        }
      });
    }
  });

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
        f = fs.openSync(path.join(`${customHtmlDir}/`, file), "r");
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
