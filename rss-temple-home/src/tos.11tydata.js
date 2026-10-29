import fs from "fs";

const f = fs.openSync("default_content/tos.html", "r");
const defaultContent = fs.readFileSync(f, "utf8");
fs.closeSync(f);

export default function () {
  return {
    layout: "standard.liquid",
    title: "Terms of Service · RSS Temple",
    description:
      "The terms that apply when you use RSS Temple, the ad-free RSS feed reader.",
    head_custom_filename: "tos.head.html",
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
