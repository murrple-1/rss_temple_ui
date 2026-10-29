// Sitemap URLs must be absolute, so only write one when the site's URL is known.
export default function () {
  return {
    eleventyExcludeFromCollections: true,
    eleventyComputed: {
      permalink: (data) => (data.env.site_url ? "/sitemap.xml" : false)
    }
  };
}
