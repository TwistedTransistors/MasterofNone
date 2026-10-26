/* ==========================================================================
   Theme configuration
   --------------------------------------------------------------------------
   strapiUrl  Base URL of your Strapi server, e.g. "http://localhost:1337"
              or "https://cms.example.com". Leave empty to use the local
              sample content in assets/js/posts.js instead.
   apiToken   Optional read-only API token (Strapi admin → Settings →
              API Tokens). Not needed when the Public role can read.
   pageSize   Stories per page in the homepage grid (4 per row).
   contactEndpoint
              Where the contact form (contact.html) sends messages: any service
              that accepts a JSON POST, e.g. a Formspree form URL like
              "https://formspree.io/f/abcdwxyz". Empty = form shows a notice.

   Tip: you can also try a server without editing this file by adding
   ?strapi=http://localhost:1337 to the page URL.
   ========================================================================== */
window.MON_CONFIG = {
  strapiUrl: "",
  apiToken: "",
  pageSize: 12,
  contactEndpoint: ""
};
