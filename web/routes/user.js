let express = require("express");
let router = express.Router();

/**
 * GET USER DATA
 */
router.get("/:userId", function (req, res) {
  db.child("users")
    .child(req.params.userId)
    .once("value")
    .then(function (snapshot) {
      res.render("user", snapshot.val());
    });
});

/**
 * GET ALL EVENTS FOR USER
 */
router.get("/:userId/events", function (req, res) {
  let data = {
    title: "All Events",
    events: [],
  };

  db.child("users")
    .child(req.params.userId)
    .child("events")
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (event) {
        console.log(event.key);
        data.events.push(`http://localhost:3000/event/${event.key.toString()}`);
      });
      res.render("user_events", data);
    });
});

/**
 * GET ALL EVENTS PENDING INVITATION REPLY FOR USER
 */
router.get("/:userId/events/pending", function (req, res) {
  let data = {
    title: "Events pending invitation response",
    eventIds: [],
  };

  db.child("users")
    .child(req.params.userId)
    .child("events")
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (event) {
        if (!event.val().isAttending) {
          data.eventIds.push(event.key.toString());
        }
      });
      console.log("Pending response " + data.eventIds);
      res.render("user_events", data);
    });
});

/**
 * GET ALL EVENTS USER IS ATTENDING
 */
router.get("/:userId/events/attending", function (req, res) {
  let data = {
    title: "Events user is attending",
    eventIds: [],
  };

  db.child("users")
    .child(req.params.userId)
    .child("events")
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (event) {
        if (event.val().isHosting || event.val().isAttending) {
          console.log(
            "Attending event" + " " + event.key + JSON.stringify(event)
          );
          data.eventIds.push(event.key);
        }
      });
      if (req.userAgent) {
        res.render("user_events", data);
      } else {
        res.send(data);
      }
    });
});

module.exports = router;
