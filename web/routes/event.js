let express = require("express");
let router = express.Router();
let handlebars = require("handlebars");
const { getEvents } = require("../../api/event-api");

/**
 * GET ALL EVENTS
 */
router.get("/", async(req, res) => {
  let events = await getEvents();
  res.render("events", result);
  Object.keys(events).forEach((eventId) => {
    // add a url property for easy use in template
    events[eventId].url = `./event/${eventId}`;
  });
  res.render("events", Object.entries(events));
});

/**
 * GET EVENT DATA
 */
router.get("/:eventId", async(req, res) => {
  db.child("events")
    .child(req.params.eventId)
    .once("value")
    .then(function (snapshot) {
      res.render("event", snapshot.val());
    });
});

module.exports = router;
