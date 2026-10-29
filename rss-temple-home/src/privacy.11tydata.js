import fs from "fs";

const f = fs.openSync("default_content/privacy.html", "r");
const defaultContent = fs.readFileSync(f, "utf8");
fs.closeSync(f);

export default function () {
  return {
    layout: "standard.liquid",
    title: "Privacy Policy · RSS Temple",
    description:
      "How RSS Temple, the ad-free RSS feed reader, collects, uses and shares information about you.",
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
}
