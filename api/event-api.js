let express = require("express");
let router = express.Router();

async function getEvents() {
  let events;
  await db.child("events")
    .once("value")
    .then((eventsData) => {
      console.log(`eventsdata is ${JSON.stringify(eventsData)}`);
      events = eventsData;
    });
  return events;
}

/**
 * GET ALL EVENTS
 */
router.get("/", async (req, res) => {
  let events = await getEvents();
  console.log(`event data is ${events}`)
  res.send(events);
});

/**
 * GET EVENT DATA
 */
router.get("/:eventId", async (req, res) => {
  db.child(`events/${req.params.eventId}`)
    .once("value")
    .then(
      (eventData) => {
        if (eventData.val() != null) {
          res.send(eventData.val());
        }
        // TODO: Make a reusable error model
        else {
          res.status(404).send({
            message: `No event exists with request eventId ${req.params.eventId}`,
          });
        }
      },
      (error) => {
        console.log(error);
        res.status(500).send(error);
      }
    );
});

/**
 * GET EVENT USERS
 */
router.get("/:eventId/users", function (req, res) {
  db.child(`events/${req.params.eventId}`)
    .once("value")
    .then(
      (eventData) => {
        if (eventData == null) {
          res.status(404).send({
            message: `Unable to find eventId ${req.params.eventsId}`,
          });
        } else {
          // We got an event, build response object and grab userIds to iterate thru
          let responseBody = { host: {}, attendees: [] };
          let inviteeIds = Object.keys(eventData.val().users);

          // Set host
          responseBody.host = eventData.val().host;

          // Set attendees
          for (let i = 0; i < inviteeIds.length; i++) {
            let userId = inviteeIds[i];
            db.child(`/users/${userId}`)
              .once("value")
              .then(function (userInfo) {
                let userResponseBody = userInfo.val();
                userResponseBody.userId = userInfo.key;
                responseBody.attendees.push(userResponseBody);

                // We have all the users now
                if (i === inviteeIds.length - 1) {
                  res.send(responseBody);
                }
              })
              .catch((error) => {
                console.log(error);
                res.status(500).send("ERROR: " + error.message);
              });
          }
        }
      },
      (error) => {
        console.log(error);
        res.status(500).send(error);
      }
    );
});

(module.exports = router), getEvents;
