let express = require("express");
let router = express.Router();

/**
 * GET EVENT DATA
 */
router.get("/:eventId", function (req, res) {
  db.child("events")
    .child(req.params.eventId)
    .once("value")
    .then(function (snapshot) {
      res.render("event", snapshot.val());
    });
});

module.exports = router;
