const path = require("path");

// Dev-server only: serve the static page at the same clean URL used in production
// (production uses the IIS rule in public/web.config).
module.exports = function (app) {
  app.get(["/resources/it-policy-awareness", "/resources/it-policy-awareness/"], (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/resources/it-policy-awareness.html"));
  });
};