import("jquery/src/jquery").then((jquery) => {
  import("bootstrap/dist/js/bootstrap.bundle");

  const $ = jquery.default;
  fetch("/config.json")
    .then((r) => r.json())
    .then((json_) => {
      $("a#app-anchor").attr("href", json_.appUrl);
      $("a#facebook-anchor").attr("href", json_.facebookUrl);
      $("a#twitter-anchor").attr("href", json_.twitterUrl);
      $("a#instagram-anchor").attr("href", json_.instagramUrl);
    });
});
