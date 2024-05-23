const document = window.document;

document.addEventListener("DOMContentLoaded", () => {
  import("jquery/dist/jquery").then(() => {
    import("bootstrap/dist/js/bootstrap.bundle");
  });
});
