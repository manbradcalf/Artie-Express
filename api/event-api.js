let express = require("express");
let router = express.Router();
let eventsDBClient = require("../data/eventsDBClient.js");
const { response } = require("express");
/**
 * GET ALL EVENTS
 */
router.get("/", async (req, res) => {
  let events = await eventsDBClient.getEvents();
  try {
    if (events) {
      res.send(events);
    } else {
      res.status(404).send({
        message: `Unable to find any events...that's odd`,
      });
    }
  } catch (e) {
    res.status(500).send({
      message: `Something went wrong looking for events:\n${e}`,
    });
  }
});

/**
 * GET EVENT DATA
 */
router.get("/:eventId", async (req, res) => {
  let eventResponse = await eventsDBClient.getEvent(req.params.eventId);
  if (!eventResponse.error) {
    res.status(200).send(eventResponse);
  } else {
    res.status(eventResponse.status).send({ error: eventResponse.error });
  }
});
/**
 * GET EVENT USERS
 */
router.get("/:eventId/users", async (req, res) => {
  let eventResponse = await eventsDBClient.getEvent(req.params.eventId);
  if (eventResponse.error) {
    res.status(eventResponse.status).send(eventResponse.error);
  } else {
    let responseBody = { host: eventResponse.host, invitees: [] };
    let inviteeIds = Object.keys(eventResponse.users);

    if (!inviteeIds) {
      res.send(responseBody);
    } else {
      // construct invitees list
      for (let i = 0; i < inviteeIds.length; i++) {
        let userId = inviteeIds[i];
        // TODO: make the usersDBClient so we dont touch fb here
        db.child(`/users/${userId}`)
          .once("value")
          .then((userData) => {
            let userResponseBody = userData.val();
            userResponseBody.userId = userData.key;
            responseBody.invitees.push(userResponseBody);
            if (i == inviteeIds.length - 1) {
              res.send(responseBody);
            }
          });
      }
    }
  }
});

module.exports = router;
