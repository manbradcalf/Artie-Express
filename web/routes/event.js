let express = require("express");
let router = express.Router();
let handlebars = require("handlebars");
const eventsDBClient = require("../../data/eventsDBClient.js");

/**
 * GET ALL EVENTS
 */
router.get("/", async (req, res) => {
  let eventData = await eventsDBClient.getEvents();
  console.log(`event Data in the API is ${JSON.stringify(eventData)} \n`)
  Object.keys(eventData).forEach((eventId) => {
    // add a url property for easy use in template
    eventData[eventId].url = `./event/${eventId}`;
    console.log(`url for eventId ${eventId} is ${eventData[eventId].url}`)
  });
  console.log(`eventData with urls is now ${JSON.stringify(eventData)}`)
  res.render("events", Object.entries(eventData));
});

/**
 * GET EVENT DATA
 */
router.get("/:eventId", async (req, res) => {
  let event = await eventsDBClient.getEvent(req.params.eventId);
  res.render("event", event);
});

module.exports = router;
