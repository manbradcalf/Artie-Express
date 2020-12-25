let express = require("express");
let router = express.Router();
let usersDBClient = require("../data/usersDBClient.js");

/**
 * GET ALL USERS
 */
router.get("/", async (req, res) => {
  try {
    let users = await usersDBClient.getUsers();
    if (users) {
      res.send(users);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * GET USER DATA
 */
router.get("/:userId", async (req, res) => {
  try {
    let user = await usersDBClient.getUser(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      console.log(`user is ${JSON.stringify(user)}`);
      res.sendStatus(500);
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * GET ALL EVENTS FOR USER
 */
router.get("/:userId/events", function (req, res) {
  // get event Ids from users events node in firebase
  db.child(`/users/${req.params.userId}/events`)
    .once("value")
    .then((userData) => {
      if (userData == null) {
        res.status(404).send({ message: "unable to find user" });
      } else {
        // we got user data, get the events and build a response
        let responseBody = { events: [] };
        let eventIds = Object.keys(userData.val());

        // get event details for each eventId in user details
        for (let i = 0; i < eventIds.length; i++) {
          db.child(`/events/${eventIds[i]}`)
            .once("value")
            .then(function (eventDBInfo) {
              let eventResponse = eventDBInfo.val();
              eventResponse.eventId = eventDBInfo.key;
              responseBody.events.push(eventResponse);

              if (i === eventIds.length - 1) {
                res.send(responseBody);
              }
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send(error);
            });
        }
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
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
      res.send(data);
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
      res.send(data);
    });
});

//TODO: Get Contacts
//         @GET("/users/{id}/contacts.json")
//         getUserContacts(@Path("id") userId: String): Response<HashMap<String, Boolean>>

//TODO: Update user
//         @PUT("/users/{userId}.json")
//         updateUser(@Body user: User, @Path("userId") userId: String): Response<User>

//TODO: Reject Invite
//         @PUT("/users/{userId}/events/{eventId}/isInviteRejected.json")
//         rejectInvite(@Body bool: Boolean?, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<Boolean>

//TODO: Accept Invite
//         @PUT("/users/{userId}/events/{eventId}/isInviteAccepted.json")
//         acceptInvite(@Body bool: Boolean?, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<Boolean>

//         @PATCH("/users/{userId}.json")
//         patchUser(@Body user: User, @Path("userId") userId: String): Response<User>

//TODO: Add Contact
//         @PUT("/users/{userId}/contacts/{contactId}.json")
//         addContactToUserAsync(@Body isContact: Boolean, @Path("userId") userId: String, @Path("contactId") contactId: String): Response<Boolean>

//TODO: Add Event To User
//         @PUT("/users/{userId}/events/{eventId}.json")
//         addEventToUser(@Body eventInviteInfo: EventInviteInfo, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<EventInviteInfo>

//         @DELETE("/events/{eventId}/users/{userId}.json")
//         removeUserFromEvent(@Path("eventId") eventId: String, @Path("userId") userId: String): Response<Response<Void>>

//         @PUT("/events/{eventId}/host.json")
//         updateEventHost(@Body host: Host, @Path("eventId") eventId: String): Response<Host>

//         @PUT("/users/{userId}/unavailable_dates/{date}.json")
//         setDateUnavailableForUser(@Body unavailable: Boolean?, @Path("userId") userId: String,
//                                               @Path("date") date: String): Response<Boolean>
//     }

module.exports = router;
