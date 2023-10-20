module.exports = function () {
  return {
    layout: "standard.liquid",
    page_name: "Terms of Service",
    head_custom_filename: "tos.head.html",
    additional_links: [
      {
        href: "/styles/tos.min.css",
        rel: "stylesheet",
        type: "text/css"
      }
    ]
  };
};
