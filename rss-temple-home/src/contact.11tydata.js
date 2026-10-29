import fs from "fs";

const f = fs.openSync("default_content/contact.html", "r");
const defaultContent = fs.readFileSync(f, "utf8");
fs.closeSync(f);

export default function () {
  return {
    layout: "standard.liquid",
    title: "Contact · RSS Temple",
    description:
      "Get in touch with RSS Temple, the calm, ad-free RSS feed reader.",
    head_custom_filename: "contact.head.html",
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
