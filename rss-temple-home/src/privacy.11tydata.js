const fs = require("fs");
const f = fs.openSync("default_content/privacy.html", "r");
const defaultContent = fs.readFileSync(f, "utf8");
fs.closeSync(f);

module.exports = function () {
  return {
    layout: "standard.liquid",
    page_name: "Privacy Policy",
    head_custom_filename: "privacy.head.html",
    default_content: defaultContent,
    additional_links: [
      {
        href: "/styles/legal.min.css",
        rel: "stylesheet",
        type: "text/css"
      }
    ]
  };
};
