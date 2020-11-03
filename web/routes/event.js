let express = require("express");
let router = express.Router();
let handlebars = require("handlebars");

/**
 * GET ALL EVENTS
 */
router.get("/", function (req, res) {
  db.child("events")
    .once("value")
    .then(function (snapshot) {
      let events = snapshot.val();
      // each entry looks like ["-firebAseIde23, {eventName, date, etc}"]
      Object.keys(events).forEach((eventId) => {
        // add a url property for easy use in template
        events[eventId].url = `./event/${eventId}`;
      });

      console.log(`about to render events: \n ${JSON.stringify(events)}`)
      res.render("events", Object.entries(events));
    });
});

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
